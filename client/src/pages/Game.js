import React, {useEffect} from 'react';
import {Button} from 'reactstrap';

function Game(props) {
    console.log('Props: ', props);
    console.log(props.scores);
    let otherUser = '';
    props.users.forEach( e => {
        if (e !== props.username[0]) {
            otherUser = e;
        }
    })
    function game() {
        if (!props.guesser) {
            return (
                <div> Waiting Room </div>
            )
        } else if(props.guesser === props.username[0]) {
            return (
                <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'}}>
                    You're Guessing!
                    <p> Your Guess Count: {props.guesses}</p>
                </div>
            )
        } else {
            console.log('timer * 10: ', `${props.timer.slice(2)/60 * 10}%`)
            return (
                <div> 
                    <h5 style={{margin: '15px 0px', textAlign: 'center', margin: 'auto'}}>
                        Your password is: <strong> {props.password} </strong>
                    </h5>
                    <div style={{display: 'flex', justifyContent: 'center', flexWrap: 'wrap', margin: 'auto'}}>
                        <div style={{marginTop: '25px'}}>
                            <Button disabled={props.timer === '0:0'} style={{margin: 'auto', marginBottom: '15px'}}color="success" onClick={props.correctWord}> Got It </Button>
                        </div>
                        <div style={{ flexBasis: '100%', height: '30px'}}></div>
                        <div>
                            <Button disabled={props.timer === '0:0'} color="warning" onClick={props.newGuess}> Guessed </Button>
                            <p> Guesses: {props.guesses}</p>
                        </div>
                    </div>
                </div>
            )
        }
    }
  return (
   <div>
        <div style={{display: 'flex', fontSize: '2em', justifyContent: 'center'}}> {props.timer} </div>
        <div style={{maxWidth: '100%', width: `100%`, height: '25px', margin: '10px 0px', backgroundColor: 'lightgray'}}>
            <div style={{maxWidth: '100%', width: `${(props.timer.slice(2)/60) * 100}%`, height: '25px', margin: '10px 0px', backgroundColor: (props.timer === '0:0') ? 'black' : 'green'}}></div>
        </div>
    <div>
        <br/>
        { game() }
        <div>
            <ul style={{listStyleType: 'none'}}>
            {
                Object.keys(props.scores).map( key => {
                    console.log(key, 'key')
                    return <li key={key}>{key} | {props.scores[key].points}</li>
                })
            }
            </ul>
        </div>
        <div style={{flexDirection: 'column', width: '100%', display: 'flex', flexAlign: 'end'}}>
            {
                props.newRound && (props.guesser !== props.username[0]) ? 
                <Button style={{margin: '10px 30px 0 30px'}} disabled={props.timer !== '0:0'} color="secondary" outline onClick={props.startNewRound}> new round </Button> : ''
            }
        </div>
    </div>
    <div style={{ display: 'flex', justifyContent: 'center', width: '100%'}}>
        <Button onClick={props.endGame} color="danger" style = {{position: 'absolute', bottom: '20px'}}> End Game </Button>
    </div>
   </div>
  );
}

export default Game;