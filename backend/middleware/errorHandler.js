class ApiError extends Error{
    constructor(statusCode, message){
        super(message),
        this.statusCode = statusCode
    }
}

const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req,res,next)).catch(next);
}

const errorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Error interno del servidor';
    
    if(err.name === 'CastError'){
        statusCode = 400;
        message = 'ID invalido';
    }

    if(err.name === 'ValidationError'){
        statusCode = 400;
        message = Object.values(err.erros).map((e) => e.message).join(', ');
    }

    if(err.code === 11000 ){
        statusCode = 400;
        message = `Ya existe un registro con ese ${Object.keys(err.keyValue)[0]}`
    }

    res.status(statusCode).json({ok: false, error: message});
};

module.exports = {ApiError, asyncHandler, errorHandler};