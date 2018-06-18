import React from 'react';
import Board from '../Board/Board';
import Pawn from './piece/Pawn';
import Rook from './piece/Rook';
import Knight from './piece/Knight';
import Bishop from './piece/Bishop';
import King from './piece/King';
import Queen from './piece/Queen';
import CapturedPieces from './amenities/CapturedPieces';
import TurnIndicator from './amenities/TurnIndicator';
import CheckDisplay from './amenities/CheckDisplay';
import TestDisplay from './amenities/TestDisplay';
import CoverGenerator from './utils/CoverGenerator';
import {searchArray, setUpInitialTile, getComponentByID, copyTiles} from './utils/utils'
import {initiateGame, requestMoveEvent, setMover} from '../socketer'


class Game extends React.Component{
  constructor(props){
    super(props);

    //set the player color
    const player = props.player;
    const opponent = (player === 'white') ? 'black' : 'white';
    const init = setUpInitialTile(player, opponent)

    this.state = {
      history:[
      {tiles: init.initial}
      ],
      stepNumber: 0,
      playerIsNext: init.playerIsNext,
      player: player,
      opponent: opponent,
      rank: 8,
      current: null,
      playerCapturedPieces: [],
      opponentCapturedPieces: [],
      playerPieces: init.playerPieces,
      opponentPieces: init.opponentPieces,
      highlightedTiles: [],
      coverGen: init.coverGen,
      playerPiecesCover: init.playerPiecesCover,
      opponentPiecesCover: init.opponentPiecesCover,
      checkMate: false,
      playerChecked: false,
      opponentChecked: false,
      playerKingMoved: false,
      opponentKingMoved: false,
      playerRook0Moved: false,
      playerRook1Moved: false,
      opponentRook0Moved: false,
      opponentRook1Moved: false,
      myIDs: init.myIDs,
      playerPieceComponents: init.playerPieceComponents,
      opponentPieceComponents: init.opponentPieceComponents,
     
    };

    setMover((piece, row, col) => {
      
      const history = this.state.history.slice(0, this.state.stepNumber + 1);
      const current = history[this.state.stepNumber];
      const tiles = copyTiles(current)
      const m_row = 7 - row
      const m_col = 7 - col
      
      //determine the value of piece
      piece.col = 7 - piece.col
      piece.row = 7 - piece.row
      console.log(tiles[piece.row][piece.col])
      const target = tiles[piece.row][piece.col]
      const curr = {data:target, row:piece.row, col:piece.col}


      console.log('piece to move', piece)
      console.log(`moving to [${m_row},${m_col}]`)
      this.movePiece(m_row,m_col, curr, tiles, history)
    })
    
  }


  //utility function for ease of passing in arguments to coverGenerator object
  //consider removing and just using this.state
  castlingState()
  {
    return {playerKingMoved:this.state.playerKingMoved, playerPieces:this.state.playerPieces, playerRook0Moved:this.state.playerRook0Moved, playerRook1Moved:this.state.playerRook1Moved, playerChecked:this.state.playerChecked, opponentPieces:this.state.opponentPieces, opponentKingMoved:this.state.opponentKingMoved, opponentRook0Moved:this.state.opponentRook0Moved, opponentRook1Moved:this.state.opponentRook1Moved, opponentChecked:this.state.opponentChecked , myIDs: this.state.myIDs}
  }

  updateState(tiles, turnOwner){
    const turnOwnerOpponent = (turnOwner === this.state.player) ? this.state.opponent : this.state.player

    const m_cover = this.state.coverGen.generateAbsoluteCover(tiles, turnOwnerOpponent, this.castlingState());
    const o_cover = this.state.coverGen.generateAbsoluteCover(tiles, turnOwner, this.castlingState());
    const check = this.testCheck(turnOwnerOpponent, o_cover);
    const checkMate = this.testCheckMate(turnOwnerOpponent, m_cover, check);
    const check_alt = this.testCheck(turnOwner, m_cover);
    if(turnOwner === this.state.player){
      this.setState({opponentPiecesCover: m_cover, playerPiecesCover: o_cover,checkMate: checkMate, opponentChecked: check, playerChecked:check_alt})
    }else{
      this.setState({playerPiecesCover: m_cover, opponentPiecesCover: o_cover, checkMate: checkMate, playerChecked: check, opponentChecked:check_alt})
    }
  }


  //function that tests for a check situation
  testCheck(color, pcover)
  {
    //get the king's location
    const kingLocation = (color === this.state.player) ? this.state.playerPieces["king"] : this.state.opponentPieces["king"]
    const myIDs = this.state.myIDs;
    for(let i = 0; i < myIDs.length; i++)
    {
      if(searchArray(pcover[myIDs[i]], kingLocation))
      {
        return true;
      }
    }
    return false;
  }

  //function that tests for a checkmate situation
  testCheckMate(color, pcover, check){
    let cover = {...pcover};
    let numMoves = 0;
    const myIDs = this.state.myIDs;
    for(let i = 0; i < myIDs.length; i++)
    {
      numMoves = numMoves + cover[myIDs[i]].length; 
    }
    if(numMoves === 0 && check)
    {
      return true;
    }else{
      return false;
    }
  }

  highlightTiles(target, row, col, tiles, history){
    const m_piece = {data:target, row:row, col:col};
    let m_pieceCover = (m_piece.data.value.color === this.state.player) ? this.state.playerPiecesCover[m_piece.data.value.ID] : this.state.opponentPiecesCover[m_piece.data.value.ID]
    
    for(let i = 0; i < m_pieceCover.length; i++)
    {
      const curr_coord = m_pieceCover[i];
      const currTileContent = tiles[curr_coord[0]][curr_coord[1]]; 
      tiles[curr_coord[0]][curr_coord[1]] = {...currTileContent, color:"highlight square"};
    }

    //keep this regardless
    history[history.length-1] = {...history[history.length-1], tiles:tiles};
    this.setState({history:history, highlightedTiles: m_pieceCover});
  }

  updateMovedStates(current, history, tiles){
    if(current.data.value.ID === "king")
      {
        if(current.data.value.color === this.state.player)
        {
          this.setState({playerKingMoved: true});
        }else
        {
          this.setState({opponentKingMoved: true});
        }
      }

      if(current.data.value.ID === "rook0")
      {
        if(current.data.value.color === this.state.player)
        {
          this.setState({playerRook0Moved: true});
        }else
        {
          this.setState({opponentRook0Moved: true});
        }
      }

      if(current.data.value.ID === "rook1")
      {
        if(current.data.value.color === this.state.player)
        {
          this.setState({playerRook1Moved: true});
        }else
        {
          this.setState({opponentRook1Moved: true});
        }
      }
      console.log('this is tiles from updateMovedStates', tiles)
      //always reset current to null after each successful move
      this.setState({
          history: history.concat([{tiles:tiles}]),
          playerIsNext: !this.state.playerIsNext, //might need to move
          stepNumber: history.length,
          current: null,
        });
  }

  movePiece(row, col, current, tiles, history){ 
      console.log('my tiles from movePiece', tiles)
      const target = tiles[row][col]
      const target_component = target.component;
      const target_value = target.value;

      //handles castling and basic king moves
      let movedRook;
      let coordSource;
      let coordDest;
      let rookTarget;
      let castling = false;
      let finalCoord;
      if(current.data.value.ID === "king" && target_value === null)
      {
        //move the king
        tiles[row][col] = {...tiles[row][col], value:current.data.value, component: current.data.component};
        tiles[current.row][current.col] = {...tiles[current.row][current.col], value: null, component: null};
        
        //determine which rook to move
        if(current.data.value.color === this.state.player)
        { 
          coordSource = {...this.state.playerPieces};
          coordDest = [[7,3],[7,5]];
        }else{
          coordSource = {...this.state.opponentPieces};
          coordDest = [[0,3],[0,5]];
        }

        if(col - current.col === 2)
        {
          //we are doing castling with rook1
          console.log("we are castling");
          const initCoord = coordSource["rook1"];
          finalCoord = coordDest[1];
          movedRook = {value: tiles[initCoord[0]][initCoord[1]].value, component:tiles[initCoord[0]][initCoord[1]].component};
          tiles[initCoord[0]][initCoord[1]] = {...tiles[initCoord[0]][initCoord[1]], value:null, component:null};
          tiles[finalCoord[0]][finalCoord[1]] = {...tiles[finalCoord[0]][finalCoord[1]], value:movedRook.value, component: movedRook.component};
          castling = true;
        }else if(col - current.col === -2)
        {
          //we are doing castling with rook0
          console.log("we are castling");
          const initCoord = coordSource["rook0"];
          finalCoord = coordDest[0];
          movedRook = {value: tiles[initCoord[0]][initCoord[1]].value, component:tiles[initCoord[0]][initCoord[1]].component};
          tiles[initCoord[0]][initCoord[1]] = {...tiles[initCoord[0]][initCoord[1]], value:null, component:null};
          tiles[finalCoord[0]][finalCoord[1]] = {...tiles[finalCoord[0]][finalCoord[1]], value:movedRook.value, component: movedRook.component};
          castling = true;
        }
        
      }else if(target_value === null)
      {
        //move the piece to an empty tile
        //here we set the target tile parameters
        tiles[row][col] = {...tiles[row][col], value:current.data.value, component: current.data.component};
        //here we set the old tile parameters
        tiles[current.row][current.col] = {...tiles[current.row][current.col], value: null, component: null};
      }else if(target_value.color != current.data.value.color)
      {
          //we only capture if the target is of different color
          //first we add the captured piece to the capturedPieces state property
          let capturedPieces;
          if(current.data.value.color === this.state.player)
          {
            capturedPieces = this.state.opponentCapturedPieces;
            this.setState({opponentCapturedPieces: [...capturedPieces, target_component]});
          }else
          {
            capturedPieces = this.state.playerCapturedPieces;
            this.setState({playerCapturedPieces: [...capturedPieces, target_component]});
          }
          
          
          //here we set the target tile parameters to the current value
          tiles[row][col] = {...tiles[row][col], value:current.data.value, component: current.data.component};
          //here we set the old tile parameters to be null
          tiles[current.row][current.col] = {...tiles[current.row][current.col], value: null, component: null};
      }

      //update the playerPieces or opponentPieces state
      let movedPieces;
      let oppPieces;


      if(current.data.value.color === this.state.player)
      {
        //player's turn
        movedPieces = {...this.state.playerPieces};
        movedPieces[current.data.value.ID] = [row, col];
        if(castling)
        {
          movedPieces[movedRook.value.ID] = finalCoord;
        }
        if(target_value !== null)
        {
          //capture scenario
          oppPieces = {...this.state.opponentPieces};
          oppPieces[target_value.ID] = [-1,-1];
          this.setState({opponentPieces: oppPieces, playerPieces: movedPieces}, () => { this.updateState(tiles, this.state.player) });
        }else
        {
          //move scenario
          this.setState({playerPieces:movedPieces},() => { this.updateState(tiles, this.state.player) });
        }
      }else
      {
        movedPieces = {...this.state.opponentPieces};
        movedPieces[current.data.value.ID] = [row,col];
        if(castling)
        {
          movedPieces[movedRook.value.ID] = finalCoord;
        }
        if(target_value !== null)
        {
          //capture scenario
          oppPieces = {...this.state.playerPieces};
          oppPieces[target_value.ID] = [-1,-1];
          this.setState({playerPieces: oppPieces, opponentPieces: movedPieces},() => { this.updateState(tiles, this.state.opponent) })
        }else{
          //move scenario
          this.setState({opponentPieces:movedPieces},() => { 
            console.log('opponentPieces', this.state.opponentPieces)
            this.updateState(tiles, this.state.opponent) });
        }
      }

      this.updateMovedStates(current, history, tiles)
      
      
  }

  tileClickHandler(row, col)
  {
    //let history = [...this.state.history];
    //const current = history[history.length - 1];
    const history = this.state.history.slice(0, this.state.stepNumber + 1);
    const current = history[this.state.stepNumber];
    const tiles = copyTiles(current)

    const target = tiles[row][col];
    const target_component = target.component;
    const target_value = target.value;

    let enterHighlightStage = false;

    if(this.state.current === null)
    {
      //we have not selected any pieces
      if(this.state.playerIsNext)
      {
        //it is currently the player's turn
        if(target_value != null)
        {
          //player is currently selecting a piece (not an empty tile)
          if(target_value.color === this.state.player)
          {
            //player has selected a piece (target) to move belonging to him
            this.setState({current: {data:target, row:row, col:col}});
            enterHighlightStage = true;
          }else
          {
            console.log("player attempted to move opponent piece");
            return;
          } 
        }
      }
      //the below code previously allowed user to select opponent pieces
      // else
      // {
      //   if(target_value != null)
      //   {
      //     if(target_value.color === this.state.opponent)
      //     {
      //       //opponent has selected a piece (target)
      //       this.setState({current: {data:target, row:row, col:col}});
      //       enterHighlightStage = true;
      //     }else
      //     {
      //       console.log("opponent attempted to move player piece");
      //       return;
      //     } 
      //   }
      // }
      
      if(enterHighlightStage)
        this.highlightTiles(target, row, col, tiles, history)

    }else
    {
      //we have selected a piece
      //the reference to our piece
      /*
        structure of current:
          - {data:{value, component, color} , row:row, col:col}
          - we can omit color within data since it is the color of the tile and should not be modified
          - note that value also has a color field that corresponds to the players
      */
      const current = this.state.current;
      const cover = this.state.highlightedTiles;
      if(!searchArray(cover,[row,col]))
      {
        //if [row,col] is not in cover, then the selected tile is invalid
        //reset the tile highlighting
        //const tempHighlight = this.state.highlightedTiles;
        for(let i = 0; i < cover.length; i++)
        {
            const curr_coord = cover[i];
            const currTileContent = tiles[curr_coord[0]][curr_coord[1]]; 
            const m_color = currTileContent.initColor;
            tiles[curr_coord[0]][curr_coord[1]] = {...currTileContent, color: m_color};
          }
          history[history.length-1] = {...history[history.length-1], tiles:tiles};
          this.setState({
            history: history,
            current: null,
            highlightedTiles: [],
          });
          return;
      }
      requestMoveEvent(current, row, col)
      this.movePiece(row, col, current, tiles, history)
      //reset the tile highlighting
      const tempHighlight = this.state.highlightedTiles;
      for(let i = 0; i < tempHighlight.length; i++)
      {
        const curr_coord = tempHighlight[i];
        const currTileContent = tiles[curr_coord[0]][curr_coord[1]]; 
        const m_color = currTileContent.initColor;
        tiles[curr_coord[0]][curr_coord[1]] = {...currTileContent, color: m_color};
      }
      this.setState({highlightedTiles: []})
      
    
      


      
    }
  }

  //resets the state upon a jumpto action
  resetState(){
    const tiles = [...this.state.history[this.state.stepNumber].tiles];
    let playerPiecesPresent = [];
    let opponentPiecesPresent = [];
    let playerPieces = {};
    let opponentPieces = {};
    for(let i = 0; i < tiles.length; i++)
    {
      for(let j = 0; j < tiles[i].length; j++)
      {
        tiles[i][j] = {...tiles[i][j], color: tiles[i][j].initColor};
        if(tiles[i][j].value != null)
        {
          const m_id = tiles[i][j].value.ID;
          const owner = tiles[i][j].value.color;
          if(owner === this.state.player)
          {
            playerPieces[m_id] = [i,j];
            playerPiecesPresent = [...playerPiecesPresent, m_id];
          }else
          {
            opponentPieces[m_id] = [i,j];
            opponentPiecesPresent = [...opponentPiecesPresent, m_id];
          }
        }
      }
    }

    let playerCapturedPieces = [];
    let opponentCapturedPieces = [];
    //check to see which pieces were not found in tiles, in which case they are captured
    const myIDs = this.state.myIDs;
    for(let k = 0; k < myIDs.length; k++)
    {
      const curr = myIDs[k];
      if(typeof(playerPiecesPresent.find((elem) =>  elem === curr)) === "undefined")
      {
        console.log("im here");
        const m_comp = getComponentByID(curr, this.state.player, this.state.player, this.playerPieceComponents, this.opponentPieceComponents);
        playerPieces[curr] = [-1,-1];
        playerCapturedPieces = [...playerCapturedPieces, m_comp];
      }
      if(typeof(opponentPiecesPresent.find((elem) => elem === curr)) === "undefined")
      {
        console.log("im here");
        const m_comp = getComponentByID(curr, this.state.opponent, this.state.player, this.state.playerPieceComponents, this.state.opponentPieceComponents);
        opponentPieces[curr] = [-1,-1];
        opponentCapturedPieces = [...playerCapturedPieces, m_comp];
      }
    }


    this.setState({ highlightedTiles:[],
                    playerPieces: playerPieces,
                    opponentPieces: opponentPieces,
                    playerCapturedPieces: playerCapturedPieces,
                    opponentCapturedPieces: opponentCapturedPieces}, 
                    () => {
                      const playerCover = this.state.coverGen.generateAbsoluteCover(tiles, this.state.player, this.castlingState())
                      const oppCover = this.state.coverGen.generateAbsoluteCover(tiles, this.state.opponent, this.castlingState())
                      const playerCheck = this.testCheck(this.state.player, oppCover);
                      const oppCheck = this.testCheck(this.state.opponent, playerCover);
                      this.setState({ playerPiecesCover: playerCover, 
                                      opponentPiecesCover: oppCover,
                                      playerChecked:playerCheck,
                                      opponentChecked: oppCheck})}); 
  }

  //function to jump to different turns of the current game
  jumpTo(step) {
    if(step < 0)
      return;
    if(this.state.checkMate)
      return;    
    this.setState({
      stepNumber: step,
      playerIsNext: (step % 2) === 0,
      current: null,
    },() => {this.resetState()});
  }

  render(){
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    
    const rank = this.state.rank;
    const selected = this.state.current;

    let checkMate = null;
    let check = null;

    if(this.state.checkMate)
    { 
      let winner = (!this.state.playerIsNext) ? this.state.player : this.state.opponent
      checkMate = (<p>CHECK MATE! {winner} wins!</p>);
    }else if(this.state.playerChecked || this.state.opponentChecked)
    {
      check = (<p>CHECK</p>);
    }
    console.log(current.tiles)
    return(
      <div className="game">
        {checkMate}
        {check}
        <CapturedPieces captured={this.state.playerCapturedPieces}/>
        <CapturedPieces captured={this.state.opponentCapturedPieces}/>
        <CheckDisplay check={this.state.playerCheck || this.state.opponentCheck}/>
        <div className="game-board">
          <Board tiles={current.tiles} rank={rank} player={this.state.player} onClick={(row,col) => this.tileClickHandler(row,col)}/>
        </div>
        <div className="game-info">
          <TurnIndicator playerTurn={this.state.playerIsNext}/>
          <button onClick={() => this.jumpTo(this.state.stepNumber-1)}>Undo</button>
        </div>
      </div>
    );
  }
}

export default Game;