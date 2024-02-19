// function fn(src, cb) {
//     console.log(src)
//     cb(null, src + " done")
// }

// fn("hello", function (err, result1) {
//     if (err) {
//         console.log(err.message);
//     }
//     console.log(result1);

//     fn("good", function (err, result2) {
//         if (err) {
//             console.log(err.message);
//         }
//         console.log(result2);
//     });
// });

// const arr = [10,20,30,40]

// const sum =(num)=>num*10>400
// const arr2 = arr.reduce((prev,curr,index,arr)=>{
//     console.log(index)
//     return prev+1
// })

// console.log(arr2)

// const fn  = ()=>{
//     setTimeout(() => {
//         console.log("hello")
//     }, 1000);
// }

// const asyncHanler = (fn)=>{
    
//         return ()=>{
//           fn()
//         }
// }

// const fun1 = asyncHanler(fn)
// fun1()
const fn=(x,y,z=9)=>{
    console.log(x,y,z)
}

fn(5,2,10)