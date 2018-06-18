import React from 'react'
import Pawn from './../piece/Pawn';
import Rook from './../piece/Rook';
import Knight from './../piece/Knight';
import Bishop from './../piece/Bishop';
import King from './../piece/King';
import Queen from './../piece/Queen';

import CoverGenerator from './CoverGenerator';

//this method searches array for value and returns true if value is found in array

const searchArray = (array, value) => {
  const temp = [...array];
  let result = temp.find((coord) => JSON.stringify(coord) === JSON.stringify(value));
  if(typeof(result) === "undefined")
  {
    //the value was not found
    return false;
  }else
  {
    return true;
  }
}

const setUpInitialTile = (player, opponent) => {
    let initial = [];
    //boolean to create alternating tile colors
    let isBlack = false;

    //construct the initial board
    
    //In this for loop, we create an empty board
    //this for loop creates a row each iteration
    for(let i = 0; i < 8; i++)
    {
      //this inner loop creates a tile each iteration
      let curr_row = [];
      for(let l = 0; l < 8; l++)
      {
        let curr_square = "black square";
        if(!isBlack)
            curr_square = "white square";
        curr_row = [...curr_row, {color: curr_square, component:null, value: null, initColor: curr_square}];
        isBlack = !isBlack; 
      }
      initial = [...initial, curr_row];
      isBlack = !isBlack;
    }

    const playerPieceComponents = {  pawn: (<Pawn m_color={player} />) , 
                                    rook: (<Rook m_color={player} />), 
                                    knight:(<Knight m_color={player} />), 
                                    bishop: (<Bishop m_color={player} />), 
                                    queen: (<Queen m_color={player}/>), 
                                    king:(<King m_color={player}/>)}
    const opponentPieceComponents = {pawn: (<Pawn m_color={opponent} />), 
                                    rook:(<Rook m_color={opponent} />), 
                                    knight: (<Knight m_color={opponent} />), 
                                    bishop: (<Bishop m_color={opponent} />), 
                                    queen: (<Queen m_color={opponent}/>), 
                                    king: (<King m_color={opponent}/>)}

    //initialize the pawns in the board
    for(let j = 0; j < 8; j++)
    {
      const pawnID = "pawn" + j;
      initial[6][j] = {...initial[6][j], value:{piece: "pawn", color:player, ID: pawnID} ,component: playerPieceComponents.pawn};
       initial[1][7-j] = {...initial[1][7-j], value:{piece: "pawn", color:opponent, ID:pawnID} ,component: opponentPieceComponents.pawn};
    }

    //initalize the other pieces for the player
    //initialize rooks
    initial[7][0] =  {...initial[7][0], 
      value: {piece: "rook", color: player, ID:"rook0"}, component:playerPieceComponents.rook};
    initial[7][7] =  {...initial[7][7], 
      value: {piece:"rook", color: player, ID:"rook1"},component: playerPieceComponents.rook};
    //initialize knights
    initial[7][1] = {...initial[7][1],
      value: {piece:"knight", color: player, ID:"knight0"}, component: playerPieceComponents.knight};
    initial[7][6] = {...initial[7][6],
      value: {piece: "knight", color: player, ID:"knight1"}, component: playerPieceComponents.knight};
    //initialize bishops
    initial[7][2] = {...initial[7][2],
      value: {piece: "bishop", color: player, ID:"bishop0"}, component: playerPieceComponents.bishop};
    initial[7][5] = {...initial[7][5],
      value: {piece: "bishop", color: player, ID:"bishop1"}, component: playerPieceComponents.bishop};

    //initialize the other pieces for the opponent
    initial[0][0] =  {...initial[0][0], 
      value: {piece: "rook", color: opponent, ID:"rook0"}, component: opponentPieceComponents.rook};
    initial[0][7] =  {...initial[0][7], 
      value: {piece: "rook", color: opponent, ID:"rook1"}, component: opponentPieceComponents.rook};
    //initialize knights
    initial[0][1] = {...initial[0][1],
      value: {piece: "knight", color: opponent, ID:"knight0"}, component: opponentPieceComponents.knight};
    initial[0][6] = {...initial[0][6],
      value: {piece: "knight", color: opponent, ID:"knight1"}, component: opponentPieceComponents.knight};
    //initialize bishops
    initial[0][2] = {...initial[0][2],
      value: {piece: "bishop", color: opponent, ID:"bishop0"}, component: opponentPieceComponents.bishop};
    initial[0][5] = {...initial[0][5],
      value: {piece: "bishop", color: opponent, ID:"bishop1"}, component: opponentPieceComponents.bishop};
    

    let playerQueen;
    let opponentQueen;
    let playerKing;
    let opponentKing;
    if(player === "white")
    {
      //initialize opponent king and queen
      initial[0][3] = {...initial[0][3],
        value: {piece: "queen", color:opponent, ID:"queen"}, component: opponentPieceComponents.queen};
      initial[0][4] = {...initial[0][4],
        value: {piece: "king", color:opponent, ID:"king" }, component: opponentPieceComponents.king};

      //initialize player king and queen
      initial[7][3] = {...initial[7][3],
        value: {piece:"queen",color: player, ID:"queen"}, component: playerPieceComponents.queen};
      initial[7][4] = {...initial[7][4],
        value: {piece: "king", color: player, ID:"king"}, component: playerPieceComponents.king};
      playerKing = [7,4];
      opponentKing = [0,4];  
      playerQueen = [7,3];
      opponentQueen = [0,3];    
    }else{
      //initalize opponent king and queen
      initial[0][3] = {...initial[0][3],
        value:{piece: "king", color: opponent, ID:"king"}, component: opponentPieceComponents.king};
      initial[0][4] = {...initial[0][4],
        value: {piece: "queen", color: opponent, ID:"queen"}, component: opponentPieceComponents.queen};

      //initialize player king and queen
      initial[7][3] = {...initial[7][3],
        value:{piece:"king", color: player, ID:"king"}, component: playerPieceComponents.king};
      initial[7][4] = {...initial[7][4],
        value: {piece:"queen", color: player, ID:"queen"}, component: playerPieceComponents.queen};
      playerKing = [7,3];
      opponentKing = [0,3];
      playerQueen = [7,4];
      opponentQueen = [0,4];
    }

    //initialize the variables that contain the coordinates of each piece for both players
    let playerPieces = {rook0:[7,0], rook1:[7,7], knight0: [7,1], knight1:[7,6], bishop0:[7,2], bishop1: [7,5], queen: playerQueen, king:playerKing};
    let opponentPieces = {rook0:[0,0], rook1:[0,7], knight0:[0,1], knight1: [0,6], bishop0:[0,2], bishop1:[0,5], queen: opponentQueen, king:opponentKing};
    let playerPiecesCover = {rook0:[], rook1:[], knight0: [[5,0],[5,2]], knight1:[[5,5],[5,7]], bishop0:[], bishop1: [], queen: [], king:[]};
    let opponentPiecesCover = {rook0:[], rook1:[], knight0: [[2,0], [2,2]], knight1:[[2,5],[2,7]], bishop0:[], bishop1: [], queen: [], king:[]};
    for(let i = 0; i < 8; i++)
    {
      playerPieces["pawn" + i] = [6,i];
      opponentPieces["pawn" + i] = [1,7 - i];
      playerPiecesCover["pawn" + i] = [[5,i],[4,i]];
      opponentPiecesCover["pawn"+ i] = [[2,7-i],[3,7-i]];      
    }

    const myIDs = ["pawn0", "pawn1", "pawn2", "pawn3", "pawn4", "pawn5", "pawn6", "pawn7", "rook0", "rook1", "knight0", "knight1", "bishop0", "bishop1", "queen", "king"]

    const coverGen = new CoverGenerator(player, myIDs);

    const playerIsNext = (player === 'white') ? true : false

    return {initial, playerIsNext, playerPieces, opponentPieces, coverGen, playerPiecesCover, opponentPiecesCover, playerPieceComponents, opponentPieceComponents, myIDs}
}

const getComponentByID = (ID, color, player, playerPieceComponents, opponentPieceComponents) => 
  {
    let compSet;
    let m_comp;
    if(color === player)
    {
      compSet = {playerPieceComponents};
    }else
    {
      compSet = {opponentPieceComponents};
    }
    switch(ID.substring(0,4))
        {
          case "pawn":
            m_comp = compSet.pawn;
            break;
          case "rook":
            m_comp = compSet.rook;
            break;
          case "bish":
            m_comp = compSet.bishop;
            break;
          case "knig":
            m_comp = compSet.knight;
            break;
          case "quee":
            m_comp = compSet.queen;
            break;
          case "king":
            m_comp = compSet.king;

        }
    return m_comp;
  }

  const copyTiles = (current) => {
    let result = []
    for(let i = 0; i < current.tiles.length; i++){
      let curr_row = [];
      for(let j = 0; j < current.tiles[i].length; j++)
      {
        let curr_tile = {value:current.tiles[i][j].value, component: current.tiles[i][j].component, color:current.tiles[i][j].color, initColor:current.tiles[i][j].initColor};
        curr_row = [...curr_row, curr_tile];
      }
      result = [...result, curr_row];
    }
    return result
  } 


export {searchArray, setUpInitialTile, getComponentByID, copyTiles}