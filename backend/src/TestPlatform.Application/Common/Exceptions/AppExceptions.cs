namespace TestPlatform.Application.Common.Exceptions;

public abstract class AppException : Exception
{
    public int StatusCode { get; }
    public List<string> Errors { get; }

    protected AppException(string message, int statusCode = 400, List<string>? errors = null)
        : base(message)
    {
        StatusCode = statusCode;
        Errors = errors ?? new List<string>();
    }
}

public class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message, 404) { }
    public NotFoundException(string entityName, object key) 
        : base($"Entity \"{entityName}\" ({key}) was not found.", 404) { }
}

public class ValidationException : AppException
{
    public ValidationException(string message, List<string>? errors = null) 
        : base(message, 400, errors) { }
}

public class UnauthorizedException : AppException
{
    public UnauthorizedException(string message = "Unauthorized access.") : base(message, 401) { }
}

public class ForbiddenException : AppException
{
    public ForbiddenException(string message = "Forbidden. You do not have permission to perform this action.") 
        : base(message, 403) { }
}

public class ConflictException : AppException
{
    public ConflictException(string message) : base(message, 409) { }
}
