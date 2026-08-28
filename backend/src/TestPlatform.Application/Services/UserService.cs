using Microsoft.EntityFrameworkCore;
using TestPlatform.Application.Common;
using TestPlatform.Application.Common.Exceptions;
using TestPlatform.Application.DTOs.Users;
using TestPlatform.Application.Interfaces;
using TestPlatform.Domain.Entities;
using TestPlatform.Domain.Enums;

namespace TestPlatform.Application.Services;

public class UserService : IUserService
{
    private readonly IAppDbContext _db;
    private readonly IPasswordHasherService _passwordHasher;
    private readonly ICurrentUserService _currentUser;

    public UserService(IAppDbContext db, IPasswordHasherService passwordHasher, ICurrentUserService currentUser)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _currentUser = currentUser;
    }

    public async Task<PagedResult<UserDto>> GetUsersAsync(UserFilterDto filter, CancellationToken ct = default)
    {
        if (_currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can manage users.");
        }

        var query = _db.Users
            .AsNoTracking()
            .Include(u => u.CreatedExams)
            .Include(u => u.Attempts)
            .AsQueryable();

        if (filter.Role.HasValue)
        {
            query = query.Where(u => u.Role == filter.Role.Value);
        }

        if (filter.IsActive.HasValue)
        {
            query = query.Where(u => u.IsActive == filter.IsActive.Value);
        }

        if (!string.IsNullOrWhiteSpace(filter.Search))
        {
            var search = filter.Search.Trim().ToLower();
            query = query.Where(u => u.FullName.ToLower().Contains(search) || u.Email.ToLower().Contains(search));
        }

        var totalCount = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((filter.PageNumber - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .Select(u => new UserDto
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role,
                IsActive = u.IsActive,
                AvatarUrl = u.AvatarUrl,
                PhoneNumber = u.PhoneNumber,
                Bio = u.Bio,
                CreatedAt = u.CreatedAt,
                ExamsCount = u.CreatedExams.Count,
                AttemptsCount = u.Attempts.Count
            })
            .ToListAsync(ct);

        return new PagedResult<UserDto>(items, totalCount, filter.PageNumber, filter.PageSize);
    }

    public async Task<UserDto> GetUserByIdAsync(Guid id, CancellationToken ct = default)
    {
        var user = await _db.Users
            .AsNoTracking()
            .Include(u => u.CreatedExams)
            .Include(u => u.Attempts)
            .FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User", id);

        return new UserDto
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email,
            Role = user.Role,
            IsActive = user.IsActive,
            AvatarUrl = user.AvatarUrl,
            PhoneNumber = user.PhoneNumber,
            Bio = user.Bio,
            CreatedAt = user.CreatedAt,
            ExamsCount = user.CreatedExams.Count,
            AttemptsCount = user.Attempts.Count
        };
    }

    public async Task<UserDto> CreateUserAsync(CreateUserDto request, CancellationToken ct = default)
    {
        if (_currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can create users.");
        }

        var emailNormalized = request.Email.Trim().ToLowerInvariant();
        var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == emailNormalized, ct);
        if (exists)
        {
            throw new ConflictException("User with this email already exists.");
        }

        var user = new User
        {
            FullName = request.FullName.Trim(),
            Email = emailNormalized,
            PasswordHash = _passwordHasher.HashPassword(request.Password),
            Role = request.Role,
            PhoneNumber = request.PhoneNumber,
            IsActive = request.IsActive
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        return await GetUserByIdAsync(user.Id, ct);
    }

    public async Task<UserDto> UpdateUserAsync(Guid id, UpdateUserDto request, CancellationToken ct = default)
    {
        if (_currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can update users.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User", id);

        var emailNormalized = request.Email.Trim().ToLowerInvariant();
        if (user.Email.ToLower() != emailNormalized)
        {
            var exists = await _db.Users.AnyAsync(u => u.Email.ToLower() == emailNormalized && u.Id != id, ct);
            if (exists) throw new ConflictException("Email already taken.");
            user.Email = emailNormalized;
        }

        user.FullName = request.FullName.Trim();
        user.Role = request.Role;
        user.IsActive = request.IsActive;
        user.PhoneNumber = request.PhoneNumber;
        user.Bio = request.Bio;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            user.PasswordHash = _passwordHasher.HashPassword(request.Password);
        }

        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);

        return await GetUserByIdAsync(user.Id, ct);
    }

    public async Task DeleteUserAsync(Guid id, CancellationToken ct = default)
    {
        if (_currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can delete users.");
        }

        if (_currentUser.UserId == id)
        {
            throw new ValidationException("You cannot delete your own admin account.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User", id);

        _db.Users.Remove(user);
        await _db.SaveChangesAsync(ct);
    }

    public async Task ActivateUserAsync(Guid id, CancellationToken ct = default)
    {
        if (_currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can activate users.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User", id);

        user.IsActive = true;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }

    public async Task DeactivateUserAsync(Guid id, CancellationToken ct = default)
    {
        if (_currentUser.Role != UserRole.Admin)
        {
            throw new ForbiddenException("Only admins can deactivate users.");
        }

        if (_currentUser.UserId == id)
        {
            throw new ValidationException("You cannot deactivate your own account.");
        }

        var user = await _db.Users.FirstOrDefaultAsync(u => u.Id == id, ct)
            ?? throw new NotFoundException("User", id);

        user.IsActive = false;
        user.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(ct);
    }
}
