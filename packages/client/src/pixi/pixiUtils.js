export const pifyTween = (tw) => {
  return new Promise((res, rej) => {
    tw.onComplete(() => { 
      res()
    })
  })
}