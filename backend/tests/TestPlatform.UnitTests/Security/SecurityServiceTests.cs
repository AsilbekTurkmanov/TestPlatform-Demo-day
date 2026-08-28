using FluentAssertions;
using Microsoft.Extensions.Configuration;
using TestPlatform.Domain.Entities;
using TestPlatform.Domain.Enums;
using TestPlatform.Infrastructure.Services;
using Xunit;

namespace TestPlatform.UnitTests.Security;

public class SecurityServiceTests
{
    [Fact]
    public void PasswordHasher_ShouldHashAndVerifyCorrectly()
    {
        // Arrange
        var hasher = new PasswordHasherService();
        var rawPassword = "SecurePassword123!";

        // Act
        var hash = hasher.HashPassword(rawPassword);
        var isValid = hasher.VerifyPassword(rawPassword, hash);
        var isInvalid = hasher.VerifyPassword("WrongPassword", hash);

        // Assert
        hash.Should().NotBeNullOrWhiteSpace();
        hash.Should().NotBe(rawPassword);
        isValid.Should().BeTrue();
        isInvalid.Should().BeFalse();
    }

    [Fact]
    public void TokenService_ShouldGenerateValidAccessTokenWithClaims()
    {
        // Arrange
        var inMemorySettings = new Dictionary<string, string?>
        {
            { "Jwt:Secret", "TestPlatform_Secret_Key_Super_Secure_Long_Enough_Key_2026" },
            { "Jwt:Issuer", "TestPlatform" },
            { "Jwt:Audience", "TestPlatform" },
            { "Jwt:ExpiryMinutes", "60" },
            { "Jwt:RefreshTokenExpiryDays", "14" }
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var tokenService = new TokenService(configuration);
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = "Test Student",
            Email = "student@test.uz",
            Role = UserRole.Student
        };

        // Act
        var (token, expiresAt) = tokenService.GenerateAccessToken(user);
        var refreshToken = tokenService.GenerateRefreshToken(user.Id);

        // Assert
        token.Should().NotBeNullOrWhiteSpace();
        expiresAt.Should().BeAfter(DateTime.UtcNow);
        refreshToken.Should().NotBeNull();
        refreshToken.UserId.Should().Be(user.Id);
        refreshToken.Token.Should().NotBeNullOrWhiteSpace();
        refreshToken.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }
}
