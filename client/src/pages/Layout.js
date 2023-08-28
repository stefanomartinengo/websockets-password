import React, { useEffect, useState} from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import {
    Navbar,
    NavbarBrand,
  } from 'reactstrap';
  import Login from './Login';
  import Game from './Game';
import useWebSocket, { ReadyState } from 'react-use-websocket';

// TODO
/**
 * 
 * 1: animations
 * 2: Improved timer bar
 * 3: Add something to guesser page
 * 4: Display scores better
 * 5: End Game Button
 * 6: API for getting words
 * 7: Host
 * 
 */

const WS_URL = 'ws://localhost:8000';


function Layout() {
    const [users, setUsers] = useState([]);
    const [username, setUsername] = useState('');
    const [guesser, setGuesser] = useState('');
    const [guesses, setGuesses] = useState(0);
    const [password, setPassword] = useState('');
    const [newRound, setNewRound] = useState(false);
    const [scores, setScores] = useState({});
    const [timer, setTimer] = useState('0.0');
  
    const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
        onOpen: () => {
          console.log('WebSocket connection established.');
        },
        onMessage: (message) => {
            let msg = JSON.parse(message.data);
            switch (msg.type) {
              case 'timerevent':
                setTimer(msg.data);
                break;
              case 'setguesser':
                setGuesser(msg.currentGame.guesser);
                break;
              case 'setguesses':
                console.log('set guess: ', msg)
                setGuesses(msg.currentGame.guesses);
                break;
              case 'setpassword':
                setPassword(msg.currentGame.password);
                break;
              case 'gameevent':
                if (msg.message === 'endround') {
                  console.log('time for a new round');
                  setNewRound(true);
                }
                break;
              case 'scores':
                console.log('msg: ', msg);
                setScores(msg.data);
            }
        },
        share: true,
        filter: () => false,
        retryOnError: true,
        shouldReconnect: () => true
      });
      useEffect( () => {
        if (username !== '') {
            setUsers([...users, username]);
        }
      }, [username]);
      useEffect( ()=> {},[guesser]);
      useEffect( () => {
        if (users.length > 0) {
            sendJsonMessage({type: 'userevent', users});
        }
    }, [users]);
    useEffect( () => {}, [timer]);
    useEffect( () => {}, [password]);
    const { lastJsonMessage } = useWebSocket(WS_URL, {
        share: true,
        filter: ()=>true
    });

    const startNewRound = () => {
      sendJsonMessage({type: 'newround', users});
      return true;
    }
    const newGuess = () => {
      sendJsonMessage({type: 'newguess', users});
    }
    const correctWord = () => {
      sendJsonMessage({type: 'correctword', users});
    }
    const endGame = () => {
      console.log('end game');
      sendJsonMessage({type: 'endgame', users});

    }
  return (
    <>
      <Navbar color="dark" dark >
        {/* <div style={{position: 'absolute', top: '35px'}}> {timer} </div>
        <div style={{position: 'absolute', top: '45px', width: '100%', height: '4px', marginTop: '25px', backgroundColor: (timer === '0:0') ? 'black' : 'green'}}></div> */}
        <NavbarBrand style={{color: 'white'}}>PASSWORD -- {username}</NavbarBrand>
      </Navbar>


      <BrowserRouter>
      <Routes>
          <Route path="/" element={ <Login setUsername={setUsername}/> } />
          <Route path="game" element={ <Game endGame={endGame} guesses={guesses} users={users} scores={scores} newGuess={newGuess} correctWord={correctWord} username={username} startNewRound={startNewRound} newRound={newRound} password={password} guesser={guesser} timer={timer}/> } />
      </Routes>
    </BrowserRouter>
    </>
  );
}

export default Layout;