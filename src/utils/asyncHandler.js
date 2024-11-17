
//using trycatch
// const asyncHandler = (fn) => async(req,res,next) =>{
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success : false,
//             massage : err.massage
//         })
//     }
// }

//use promise
const asyncHandler = (fn) =>{
    return (req,res,next) =>{
        Promise.resolve(fn(req,res,next)).catch((err) => next(err))
    }
}

export {asyncHandler}