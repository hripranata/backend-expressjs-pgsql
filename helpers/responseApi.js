exports.success = (message, results, statusCode) => ({
    message,
    success: true,
    code: statusCode,
    results,
});

exports.error = (message, statusCode) => {
    let stsCode = statusCode;
    const codes = [200, 201, 400, 401, 404, 403, 422, 500];

    const findCode = codes.find((code) => code === statusCode);

    if (!findCode) {
        stsCode = 500;
    } else {
        stsCode = findCode;
    }

    return {
        message,
        code: stsCode,
        error: true,
    };
};

exports.validation = (errors) => ({
    message: 'Validation errors',
    error: true,
    code: 422,
    errors,
});