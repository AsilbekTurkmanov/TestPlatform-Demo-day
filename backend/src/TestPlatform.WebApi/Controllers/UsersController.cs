using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TestPlatform.Application.Common;
using TestPlatform.Application.DTOs.Users;
using TestPlatform.Application.Interfaces;

namespace TestPlatform.WebApi.Controllers;

[Authorize]
public class UsersController : BaseApiController
{
    private readonly IUserService _userService;

    public UsersController(IUserService userService)
    {
        _userService = userService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<UserDto>>>> GetUsers([FromQuery] UserFilterDto filter, CancellationToken ct)
    {
        var result = await _userService.GetUsersAsync(filter, ct);
        return OkResponse(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUserById(Guid id, CancellationToken ct)
    {
        var result = await _userService.GetUserByIdAsync(id, ct);
        return OkResponse(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<UserDto>>> CreateUser([FromBody] CreateUserDto request, CancellationToken ct)
    {
        var result = await _userService.CreateUserAsync(request, ct);
        return OkResponse(result, "User created successfully.");
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(Guid id, [FromBody] UpdateUserDto request, CancellationToken ct)
    {
        var result = await _userService.UpdateUserAsync(id, request, ct);
        return OkResponse(result, "User updated successfully.");
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult<ApiResponse<string>>> DeleteUser(Guid id, CancellationToken ct)
    {
        await _userService.DeleteUserAsync(id, ct);
        return OkResponse("User deleted", "User deleted successfully.");
    }

    [HttpPost("{id:guid}/activate")]
    public async Task<ActionResult<ApiResponse<string>>> ActivateUser(Guid id, CancellationToken ct)
    {
        await _userService.ActivateUserAsync(id, ct);
        return OkResponse("User activated", "User account activated successfully.");
    }

    [HttpPost("{id:guid}/deactivate")]
    public async Task<ActionResult<ApiResponse<string>>> DeactivateUser(Guid id, CancellationToken ct)
    {
        await _userService.DeactivateUserAsync(id, ct);
        return OkResponse("User deactivated", "User account deactivated successfully.");
    }
}
