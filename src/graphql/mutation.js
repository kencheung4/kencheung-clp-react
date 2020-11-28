export const ClickBlue = `
  mutation ClickBlue($id: ID!) {
    clickBlue(id: $id) {
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

export const ClickRed = `
  mutation ClickRed($id: ID!) {
    clickRed(id: $id) {  
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
  ClickBlue,
  ClickRed,
}