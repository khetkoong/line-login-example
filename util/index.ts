export const generateId = () => {
  const possibleCharacters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
  let randomID = ""
  for (let i = 0; i < 20; i++) {
    randomID += possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
  }
  return randomID
}