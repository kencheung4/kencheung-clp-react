export const updatedGameSubscription = `
  subscription updatedGame($id: ID!) {
    updatedGame(id: $id) {
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

export const resetedGameSubscription = `
  subscription resetedGameSubscription {
    resetedGame {
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
  updatedGameSubscription,
  resetedGameSubscription,
}