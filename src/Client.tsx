import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { graphqlMutation } from 'aws-appsync-react';

import {
  ClickBlue,
  ClickRed,
} from './graphql/mutation';

import {
  GetGame,
} from './graphql/query';

import {
  resetedGameSubscription,
} from './graphql/subscription';

interface Game {
  blue: number;
  red: number;
  black: number;
  clicks: any;
  id: string
  createdAt: string
}

type ClientProps = {
  clickBlue: Function,
  clickRed: Function,
  game: Game,
  subscribeResetGame: Function,
};

function Client(props: ClientProps) {

  console.log("props.game.id", props.game?.id);

  React.useEffect(() => {
    props.subscribeResetGame();
  }, []);

  const handleClick = (color: string) => {
    return (e: any) => {
      if (!props.game.id) {
        console.warn("the game is not ready");
        return;
      }
      console.log("props.game.id", props.game.id);
      if (color === 'blue') {
        props.clickBlue(props.game.id);
      } else if (color === 'red') {
        props.clickRed(props.game.id);
      }
    };
  };

  return (
    <div className="Client p-8">
      <div className="Buttons flex flex-wrap space-x-12 justify-center">
        <div role="button" tabIndex={0} aria-label="+" className="BlueButton p-24 bg-blue-400 rounded-full" onKeyDown={handleClick('blue')} onClick={handleClick('blue')} />
        <div role="button" tabIndex={0} aria-label="-" className="RedButton p-24 bg-red-400 rounded-full" onKeyDown={handleClick('red')} onClick={handleClick('red')} />
      </div>
    </div>
  );
}

export default compose(
  graphql(gql(GetGame), {
    options: {
      fetchPolicy: 'no-cache'
    },
    props: (props: any) => ({
      game: props.data.getGame,
      subscribeResetGame: () => {
        props.data.subscribeToMore({
          document: gql(resetedGameSubscription),
          updateQuery: (prev: any, result: any) => {
            console.log("subscribeResetGame updateQuery", result);
            return {
              getGame: {
                ...result.subscriptionData.data.resetedGame,
              },
            }
          }
        })
      },
    })
  }),
  graphql(gql(ClickBlue), {
    options: {
    },
    props: (props: any) => ({
      clickBlue: (id: string) => {
        props.mutate({
          variables: { id },
        });
      }
    }),
  }),
  graphql(gql(ClickRed), {
    options: {
    },
    props: (props: any) => ({
      clickRed: (id: string) => {
        props.mutate({
          variables: { id },
        });
      }
    }),
  })
)(Client);
