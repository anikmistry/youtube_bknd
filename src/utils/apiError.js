class apiError extends Error {
    constructor(
        statusCode,
        message = "something worng",
        error = [],
        statck = "",
      
    ){
        super(message)
        this.statusCode = statusCode,
        this.data = null,
        this.success = false,
        this.error = error
        if(statck){
            this.statck = statck
        }else{
            Error.captureStackTrace(this, this.constractor)
        }
    }
}

export {apiError}