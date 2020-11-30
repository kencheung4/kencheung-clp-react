import React from 'react';
import gql from 'graphql-tag';
import { graphql, compose } from 'react-apollo';
import { buildSubscription } from 'aws-appsync'
import { graphqlMutation } from 'aws-appsync-react';
import { Line } from 'react-chartjs-2';
import moment from 'moment';
import _ from 'lodash';


import {
  GetGame,
} from './graphql/query';

import {
  ResetGame,
} from './graphql/mutation';

import {
  updatedGameSubscription,
  resetedGameSubscription,
} from './graphql/subscription';

interface Click {
  createdAt: string
  color: string
}

interface Game {
  blue: number;
  red: number;
  black: number;
  clicks: [Click];
  id: string;
  createdAt: string;
  isSubscribed: boolean;
}

interface ChartDataState {
  hasInit: boolean,
  labels: Array<number>,
  redData: Array<number>,
  blueData: Array<number>,
  blackData: Array<number>,
}

type DashboardProps = {
  game: Game,
  subscribeToMoreClicks: Function,
  resetGame: Function,
}

const Loading = () => {
  return <div>Loading...</div>
}

let chartUpdateInterval: NodeJS.Timeout;
const showMaxRecentSeconds = 30;

function Dashboard(props: DashboardProps) {

  const [chartData, setChartData] = React.useState<ChartDataState>({
    hasInit: false,
    labels: [],
    redData: [],
    blueData: [],
    blackData: []
  });

  const { red, blue, black, clicks, createdAt, id } = props.game || {};

  React.useEffect(() => {
    props.resetGame();
    setChartData({
      hasInit: true,
      labels: [],
      redData: [],
      blueData: [],
      blackData: []
    });
  }, []);

  React.useEffect(() => {
    if (props.game?.id) {
      console.log("start subscribeToMoreClicks", props.game.id);
      props.subscribeToMoreClicks(props.game.id);
    }
  }, [props.game]);

  React.useEffect(() => {
    if (!props.game?.id) return;

    const updateChart = () => {
      const minTime = moment(clicks[0]?.createdAt).unix();
      const maxTime = moment(clicks[clicks.length - 1]?.createdAt).unix();

      const intervals = maxTime - minTime + 1 > showMaxRecentSeconds ? showMaxRecentSeconds : maxTime - minTime + 1;

      const labels = _.times(intervals, (n) => n + 1);
      const initialData = _.times(intervals, () => 0);
      const redData = [...initialData];
      const blueData = [...initialData];
      const blackData = [...initialData];

      clicks.forEach(click => {
        console.log("LOOPING each click", click);
        const currentTimeInterval = intervals - (maxTime - moment(click.createdAt).unix()) - 1;
        if (currentTimeInterval < 0) {
          // it's before showMaxRecentSeconds, skip show this click
          return;
        }
        if (click.color === 'red') {
          redData[currentTimeInterval] += 1;
        } else if (click.color === 'blue') {
          blueData[currentTimeInterval] += 1;
        }
        blackData[currentTimeInterval] = blueData[currentTimeInterval] - redData[currentTimeInterval];
      })

      setChartData({
        hasInit: true,
        labels,
        redData,
        blueData,
        blackData
      })
    }

    if (chartData.hasInit) {
      clearInterval(chartUpdateInterval);
      chartUpdateInterval = setInterval(updateChart, 5000);
    } else {
      updateChart();
    }

  }, [props.game]);

  if (!id) {
    return <Loading />
  }

  const data = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'blue',
        data: chartData.blueData,
        fill: false,
        backgroundColor: 'rgb(96, 165, 250)',
        borderColor: 'rgba(96, 165, 250, 0.2)',
      },
      {
        label: 'red',
        data: chartData.redData,
        fill: false,
        backgroundColor: 'rgb(248, 113, 113)',
        borderColor: 'rgba(248, 113, 113, 0.2)',
      },
      {
        label: 'black',
        data: chartData.blackData,
        fill: false,
        backgroundColor: 'rgb(0, 0, 0)',
        borderColor: 'rgba(0, 0, 0, 0.2)',
      },
    ],
  }

  const options = {
    scales: {
      yAxes: [
        {
          ticks: {
            beginAtZero: false,
          },
          scaleLabel: {
            display: true,
            labelString: 'Click(s)'
          }
        },
      ],
      xAxes: [
        {
          scaleLabel: {
            display: true,
            labelString: 'Seconds'
          }
        },
      ],
    },
  }

  return (
    <div className="Dashboard p-8 flex justify-center">
      <div className='flex flex-col'>
        <span>This chart show the recent {showMaxRecentSeconds} seconds clicks</span>
        <Line data={data} options={options} width={480} height={240} />
        <div className='flex flex-wrap justify-center p-8'>
          <div className='flex items-center justify-center py-16 bg-blue-400 text-2xl text-white mx-8 w-60'>
            {props.game.blue}
          </div>
          <div className='flex items-center justify-center py-16 bg-red-400 text-2xl text-white mx-8 w-60'>
            {props.game.red}
          </div>
        </div>
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
      subscribeToMoreClicks: (id: string) => {
        props.data.subscribeToMore({
          document: gql(updatedGameSubscription),
          variables: { id },
          updateQuery: (prev: any, result: any) => {
            console.log("subscribeToMoreClicks updateQuery", result);
            return {
              getGame: {
                ...result.subscriptionData.data.updatedGame,
              },
            }
          }
        })
      },
    })
  }),
  graphql(gql(ResetGame), {
    options: {
      update: (cache, result: any) => {
        console.log('reset game update cache', result);
        const newGame = result.data.resetGame;
        cache.writeQuery({
          query: gql(GetGame),
          data: {
            getGame: {
              ...result.data.resetGame
            }
          },
        });
      },
    },
    props: (props: any) => ({
      resetGame: () => {
        props.mutate();
      }
    }),
  }),
)(Dashboard);
