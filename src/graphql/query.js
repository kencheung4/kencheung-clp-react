
export const GetGame = `
  query getGame {
    getGame {  
      id
      blue
      red
      black
      clicks {
        color
        createdAt
      }
      createdAt
    }
  }
`

export default {
  GetGame,
}