module.exports=class ApiError extends Error{
    status;
    errors;

    constructor(status,message,errors=[]){
        super(message);
        this.status=status;
        this.errors=errors;
    }

    static UnavthorizedError(){
        return new ApiError(401, "user is not authorized")

    }

    static internal(message) {
        return new ApiError(500, message)
    }

    static badRequest(message) {
        return new ApiError(404, message)
    }

}