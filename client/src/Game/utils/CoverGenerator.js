/*
  This class 

*/

import {searchArray} from './utils'

class CoverGenerator
{
  constructor(player, myIDs)
  {
    let opponent;
    if(player === "white"){
      opponent = "black";
    }else{
      opponent = "white";
    }

    this.state = {
      player:player,
      opponent:opponent,
      myIDs: myIDs
    }
  }

  //cover generator functions
  generatePawnCover = (row, col, color, tiles) =>
  {
    let legalMovesPawn = [];
    if(color === this.state.player)
    {
      if(row > -1 && row < 8 && col > -1 && col < 8)
      {
        //can potentially move forward by 1 or capture
        if(row-1 > -1 && tiles[row-1][col].value === null){
          legalMovesPawn = [...legalMovesPawn, [row-1, col]];
        }
        if(row-1 > -1 && col+1 < 8 && tiles[row-1][col+1].value !== null)
        {
          if(tiles[row-1][col+1].value.color !== color)
          {
            legalMovesPawn = [...legalMovesPawn, [row-1, col+1]];    
          }
        }
        if(row-1 > -1 && col - 1 > -1 && tiles[row-1][col-1].value !== null)
        {
          if(tiles[row-1][col-1].value.color !== color)
          {
            legalMovesPawn = [...legalMovesPawn, [row-1, col-1]];    
          }
        }
        if(row === 6)
        {
          if(tiles[row-1][col].value === null && tiles[row-2][col].value === null){
            legalMovesPawn = [...legalMovesPawn, [row-2, col]];
          }
        }
      }
    }else if(color === this.state.opponent)
    {
      //can potentially move forward by 1 or capture
      if(row > -1 && row < 8 && col > -1 && col < 8)
      {
        if(row+1 < 8 && tiles[row+1][col].value === null){
          legalMovesPawn = [...legalMovesPawn, [row+1, col]];
        }
        if(row + 1 < 8 && col + 1 < 8 && tiles[row+1][col+1].value !== null)
        {
          if(tiles[row+1][col+1].value.color !== color)
          {
            legalMovesPawn = [...legalMovesPawn, [row+1, col+1]];    
          }
        }
        if(row + 1 < 8 && col-1 > -1 && tiles[row+1][col-1].value !== null)
        {
          if(tiles[row+1][col-1].value.color !== color)
          {
            legalMovesPawn = [...legalMovesPawn, [row+1, col-1]];    
          }
        }
        if(row === 1)
        {
          if(tiles[row+1][col].value === null && tiles[row+2][col].value === null){
            legalMovesPawn = [...legalMovesPawn, [row+2, col]];
          }
        }
      }
      
    }
    return legalMovesPawn;
  }

  generateKnightCover = (row, col, color, tiles) =>
  {
    if(row === -1 && col === -1)
      return [];
    const legalMovesKnight = [  [row+2, col-1],
                                [row+2, col+1],
                                [row-2, col-1],
                                [row-2, col+1],
                                [row-1, col+2],
                                [row+1, col+2],
                                [row-1, col-2],
                                [row+1, col-2]];
    let knightCover = legalMovesKnight.filter((coord) => {
      if(coord[0] > 7 || coord[0] < 0 || coord[1] > 7 || coord[1] < 0)
      {
        return false;
      }

      if(tiles[coord[0]][coord[1]].value === null)
      {
        return true;
      }
      else if(tiles[coord[0]][coord[1]].value != null)
      {
        if(tiles[coord[0]][coord[1]].value.color != color)
        {
          return true;
        }else
        {
          return false;
        }
      }
    }); 
    return knightCover;
  }

  generateRookCover = (row, col, color, tiles) =>
  {
    if(row === -1 && col === -1)
      return [];
    let rookCover = [];
    let iOngoing = true;
    let jOngoing = true;
    let kOngoing = true;
    let lOngoing = true;
    if(row > 7 || row < 0 || col > 7 || col < 0)
    {
      return rookCover;
    }
    for(let i = row+1, j = row-1, k = col+1, l = col-1; i < 8 || j > -1 || k < 8 || l > -1; i++, j--, k++, l--)
    {
      const curr_i = [i, col];
      const curr_j = [j, col];
      const curr_k = [row, k];
      const curr_l = [row, l];
      
      if(iOngoing && i < 8)
      {
        if(tiles[curr_i[0]][curr_i[1]].value === null)
          {
            //if the currently examined tile is null we add it to the cover
            rookCover = [...rookCover, curr_i];
          }else if(tiles[curr_i[0]][curr_i[1]].value.color !== color){
              rookCover = [...rookCover, curr_i];
              iOngoing = false;
          }else
          {
            iOngoing = false;
          }
      }

      if(kOngoing && k < 8)
      {
        if(tiles[curr_k[0]][curr_k[1]].value === null)
        {
          rookCover = [...rookCover, curr_k];
        }else if(tiles[curr_k[0]][curr_k[1]].value.color !== color)
        {
          rookCover = [...rookCover, curr_k];
          kOngoing = false;
        }else{
          kOngoing = false;
        }
      }

      if(jOngoing && j > -1)
      {
        if(tiles[curr_j[0]][curr_j[1]].value === null)
        {
          rookCover = [...rookCover, curr_j];
        }else if(tiles[curr_j[0]][curr_j[1]].value.color !== color){
          rookCover = [...rookCover, curr_j];
          jOngoing = false;
        }else
        {
          jOngoing = false;
        }
      }

      if(lOngoing && l > -1)
      {
        if(tiles[curr_l[0]][curr_l[1]].value === null)
        {
          rookCover = [...rookCover, curr_l];
        }else if(tiles[curr_l[0]][curr_l[1]].value.color !== color){
          rookCover = [...rookCover, curr_l];
          lOngoing = false;
        }else
        {
          lOngoing = false;
        }
      }
    }
    return rookCover;
  }

  generateBishopCover = (row, col, color, tiles) =>
  {
    if(row === -1 && col === -1)
      return [];
    let bishopCover = [];
    let ijOngoing = true;
    let klOngoing = true; 
    for(let i = row+1, j = col+1, k = row-1, l = col-1; i < 8 || j < 8 || k > -1 || l > -1; i++, j++, k--, l--)
    {
      const curr_ij = [i, j];
      const curr_kl = [k, l];
      if(ijOngoing && (i < 8 && j < 8))
      {
        if(tiles[curr_ij[0]][curr_ij[1]].value === null)
        {
          bishopCover = [...bishopCover, curr_ij];
        }else if(tiles[curr_ij[0]][curr_ij[1]].value.color !== color)
        {
          bishopCover = [...bishopCover, curr_ij];
          ijOngoing = false;
        }else
        {
          ijOngoing = false;
        }
      }

      if(klOngoing && (k > -1 && l > -1))
      {
        if(tiles[curr_kl[0]][curr_kl[1]].value === null)
        {
          bishopCover = [...bishopCover, curr_kl];
        }else if(tiles[curr_kl[0]][curr_kl[1]].value.color !== color)
        {
          bishopCover = [...bishopCover, curr_kl];
          klOngoing = false;
        }else{
          klOngoing = false;
        }
      }
    }

    ijOngoing = true;
    klOngoing = true;
    for(let i = row+1, j = col-1, k = row-1, l = col+1; i < 8 || j > -1 || k > -1 || l < 8; i++, j--, k--, l++)
    {
      const curr_ij = [i, j];
      const curr_kl = [k, l];
      if(ijOngoing && (i < 8 && j > -1))
      {
        if(tiles[curr_ij[0]][curr_ij[1]].value === null)
        {
          bishopCover = [...bishopCover, curr_ij];
        }else if(tiles[curr_ij[0]][curr_ij[1]].value.color !== color)
        {
          bishopCover = [...bishopCover, curr_ij];
          ijOngoing = false;
        }else
        {
          ijOngoing = false;
        }
      }

      if(klOngoing && (k > -1 && l < 8))
      {
        if(tiles[curr_kl[0]][curr_kl[1]].value === null)
        {
          bishopCover = [...bishopCover, curr_kl];
        }else if(tiles[curr_kl[0]][curr_kl[1]].value.color !== color)
        {
          bishopCover = [...bishopCover, curr_kl];
          klOngoing = false;
        }else{
          klOngoing = false;
        }
      }
    }

    return bishopCover;
  }

  generateQueenCover = (row, col, color, tiles) =>
  {
    if(row === -1 && col === -1)
      return [];
    let queenCover = this.generateBishopCover(row,col,color,tiles).concat(this.generateRookCover(row,col,color,tiles));
    return queenCover;
  }

  
  generateKingCover = (row, col, color, tiles) =>
  {
    const legalMovesKing = [[row-1,col-1],
                            [row-1,col],
                            [row-1, col+1],
                            [row,col-1],
                            [row, col+1],
                            [row+1,col-1],
                            [row+1, col],
                            [row+1, col+1]];
    let kingCover = legalMovesKing.filter((coord) => {
      if(coord[0] > 7 || coord[0] < 0 || coord[1] > 7 || coord[1] < 0)
      {
        return false;
      }
      if(tiles[coord[0]][coord[1]].value === null)
      {
        return true;
      }
      else if(tiles[coord[0]][coord[1]].value != null)
      {
        if(tiles[coord[0]][coord[1]].value.color != color)
        {
          return true;
        }else
        {
          return false;
        }
      }
    }); 

    return kingCover;
  }

  getMergeCover(color, playerPiecesCover, opponentPiecesCover)
  {
    let initialCover;
    let mergedCover = [];
    if(color === this.state.player)
    {
      initialCover = {...playerPiecesCover};
    }else{
      initialCover = {...opponentPiecesCover};
    }

    const myIDs = [...this.state.myIDs];
    for(let i = 0; i < myIDs.length; i++)
    {
      mergedCover = mergedCover.concat(initialCover[myIDs[i]]);
    }

    return mergedCover;
  }

  handleCastling(color, tiles, state)
  {
    let result = [];

    let pieces;
    let kingPosition;
    let rook0Position;
    let rook1Position;
    let rook0Path;
    let rook1Path;
    let kingMoved;
    let rook0Moved;
    let rook1Moved;
    let checked;
    let clearPath0 = true;
    let clearPath1 = true;
    let rowIndex;
    let oppCover;
    if(color === this.state.player)
    {
      pieces = {...state.playerPieces};
      rowIndex = 7;
      kingMoved = state.playerKingMoved;
      rook0Moved = state.playerRook0Moved;
      rook1Moved = state.playerRook1Moved;
      checked = state.playerChecked;
      oppCover = this.getMergeCover(this.state.opponent);
    }else{
      pieces = {...state.opponentPieces};
      rowIndex = 0;
      kingMoved = state.opponentKingMoved;
      rook0Moved = state.opponentRook0Moved;
      rook1Moved = state.opponentRook1Moved;
      checked = state.opponentChecked;
      oppCover = this.getMergeCover(this.state.player);
    }
    rook0Path = [[rowIndex,1],[rowIndex,2],[rowIndex,3]];
    rook1Path = [[rowIndex,5],[rowIndex,6]];
    kingPosition = pieces["king"];
    rook0Position = pieces["rook0"];
    rook1Position = pieces["rook1"];

    //check if the path is clear
    for(let i = 0; i < rook0Path.length; i++)
    {
      if(tiles[rook0Path[i][0]][rook0Path[i][1]].value != null)
      {
        clearPath0 = false;
        break;
      }
      if(searchArray(oppCover,rook0Path[i]))
      {
        clearPath0 = false;
        break;
      }
    }

    for(let j = 0; j < rook1Path.length; j++)
    {
      if(tiles[rook1Path[j][0]][rook1Path[j][1]].value != null)
      {
        clearPath1 = false;
        break;
      }
      if(searchArray(oppCover,rook1Path[j]))
      {
        clearPath1 = false;
        break;
      }
    }

    if(!checked && !kingMoved)
    {
      //add to the return array
      if(!rook0Moved && clearPath0)
      {
        result =[...result, [rowIndex, 2]];  
      }
      if(!rook1Moved && clearPath1)
      {
        result = [...result, [rowIndex, 6]];
      }
    }
    return result;
  }

  //this method generates the cover for a piece given its row , col, color and ID based on given board configuration (tiles)
  generateCoverByID(row, col, color, tiles, ID, state)
  {
    let cover;
    if(row > 7 || row < 0 || col > 7 || col < 0)
    {
      return [];
    }
    switch(ID){
      case "pawn0":
      case "pawn1":
      case "pawn2":
      case "pawn3":
      case "pawn4":
      case "pawn5":
      case "pawn6":
      case "pawn7":
        cover = this.generatePawnCover(row, col, color, tiles);
        break;
      case "rook0":
      case "rook1":
        cover = this.generateRookCover(row, col, color, tiles);
        break;
      case "knight0":
      case "knight1":
        cover = this.generateKnightCover(row, col, color, tiles);
        break;
      case "bishop0":
      case "bishop1":
        cover = this.generateBishopCover(row, col, color, tiles);
        break;
      case "queen":
        cover = this.generateQueenCover(row, col, color, tiles);
        break;
      case "king":
        //for king we need to handle castling, we do not handle this in the coverGenerator since it requires knowledge of the board
        cover = this.generateKingCover(row, col, color, tiles).concat(this.handleCastling(color, tiles,state));
        break;
      default:
    }
    return cover;
  }

  //this method generates the total cover of all the pieces of a player given the player's color, pieceSet and a board configuration
  generateCurrentCover(tiles, pieceSet, color, state)
  {
    let returnArray = [];
    const myIDs = this.state.myIDs;
    for(let i = 0; i < myIDs.length; i++)
    {
      const currPieceCoord = pieceSet[myIDs[i]];
      const curr_cover = this.generateCoverByID(currPieceCoord[0], currPieceCoord[1], color, tiles, myIDs[i], state);
      returnArray = returnArray.concat(curr_cover);
    }

    return returnArray;
  }

  //the main algorithm for the program to control complex restrictions relating to king checks
  //current: the considered piece
  //curr_cover: the cover of the considered piece
  //board: the configuration of the board to be tested for
  //this method essentially tests all the possible moves of current (based on curr_cover) and filters the legal moves
  boardTest(board, curr_cover, current, state)
  {
    let returnArray = [];
    let pieceSet;
    let turnOpponent;

    //we initialize the proper piece set to generate the cover
    console.log('my current',current)
    if(current.data.value.color === this.state.player)
    {
      //it is the player's turn so we want to generate cover for opponent
      const temp = state.opponentPieces;
      pieceSet = {pawn0: temp.pawn0, pawn1: temp.pawn1, pawn2: temp.pawn2, pawn3: temp.pawn3, pawn4: temp.pawn4, pawn5: temp.pawn5, pawn6:temp.pawn6, pawn7: temp.pawn7, rook0: temp.rook0, rook1: temp.rook1, knight0: temp.knight0, knight1: temp.knight1, bishop0: temp.bishop0, bishop1: temp.bishop1, queen: temp.queen, king: temp.king};
      turnOpponent = this.state.opponent;
    }else
    {
      //it is the opponent's turn so we want to generate cover for player
      const temp = state.playerPieces;
      pieceSet = {pawn0: temp.pawn0, pawn1: temp.pawn1, pawn2: temp.pawn2, pawn3: temp.pawn3, pawn4: temp.pawn4, pawn5: temp.pawn5, pawn6:temp.pawn6, pawn7: temp.pawn7, rook0: temp.rook0, rook1: temp.rook1, knight0: temp.knight0, knight1: temp.knight1, bishop0: temp.bishop0, bishop1: temp.bishop1, queen: temp.queen, king: temp.king};
      turnOpponent = this.state.player;
    }


    //we try each move that the selected piece can do and check to see if it will result in a check
    //console.log("attempting to move " + current.data.value.color + " " + current.data.value.ID);
    for(let i = 0; i < curr_cover.length; i++)
    {
      const currentMove = curr_cover[i];
      //console.log("currently testing for move to " + "[" + currentMove[0] + "," + currentMove[1] + "]");
      
      //below we generate the tile to test from, we need to do this since JavaScript uses pointers for object reference
      let tiles = [];
      for(let j = 0; j < board.length; j++)
      {
        let curr_row = [];
        for(let k = 0; k < board[j].length; k++)
        {
          const tempTile = {color: board[j][k].color, component:board[j][k].component, value: board[j][k].value, initColor: board[j][k].initColor};
          curr_row = [...curr_row, tempTile];
        }
        tiles = [...tiles, curr_row];
      }

      //here we reconfigure the tile based on the current move
      if(tiles[currentMove[0]][currentMove[1]].value === null)
      {
        //modify the tiles variable according to the move
        tiles[currentMove[0]][currentMove[1]] = {...tiles[currentMove[0]][currentMove[1]], value:current.data.value, component: current.data.component};
        tiles[current.row][current.col] = {...tiles[current.row][current.col], value: null, component: null};
      }else if(tiles[currentMove[0]][currentMove[1]].value.color != current.data.value.color)
      {
          //A capture scenario
          //we need to remove the captured piece from the piece set
          pieceSet[tiles[currentMove[0]][currentMove[1]].value.ID] = [-1,-1];
          //modify the tiles variable according to the move
          tiles[currentMove[0]][currentMove[1]] = {...tiles[currentMove[0]][currentMove[1]], value:current.data.value, component: current.data.component};
          tiles[current.row][current.col] = {...tiles[current.row][current.col], value: null, component: null};
      }
      //here we generate the cover of all the opponent's piece and concatenate them together to result based of the newly configured tiles
      const result = this.generateCurrentCover(tiles, pieceSet, turnOpponent, state);
      //console.log("here is the opponent's cover after the move was made ");
      //console.log(result);
      
      let kingCoord = null;
      if(current.data.value.color === this.state.player)
      {
        if(current.data.value.ID === "king")
        {
          kingCoord = currentMove;
        }else
        {
          kingCoord = state.playerPieces.king;  
        }
      }else{
        if(current.data.value.ID === "king")
        {
          kingCoord = currentMove;
        }else
        {
          kingCoord = state.opponentPieces.king;  
        }
      }
      
      if(!searchArray(result, kingCoord))
      {
        returnArray = [...returnArray, currentMove];
      }else
      {
        console.log("we have a check scenario from moving " + current.data.value.ID + " to [" + currentMove[0] + "," + currentMove[1] + "]");
      }
      //we reset the proper piece set to generate the cover
      if(current.data.value.color === this.state.player)
      {
        //it is the player's turn so we want to generate cover for opponent
        const temp = state.opponentPieces;
        pieceSet = {pawn0: temp.pawn0, pawn1: temp.pawn1, pawn2: temp.pawn2, pawn3: temp.pawn3, pawn4: temp.pawn4, pawn5: temp.pawn5, pawn6:temp.pawn6, pawn7: temp.pawn7, rook0: temp.rook0, rook1: temp.rook1, knight0: temp.knight0, knight1: temp.knight1, bishop0: temp.bishop0, bishop1: temp.bishop1, queen: temp.queen, king: temp.king};
        turnOpponent = this.state.opponent;
      }else
      {
        //it is the opponent's turn so we want to generate cover for player
        const temp = state.playerPieces;
        pieceSet = {pawn0: temp.pawn0, pawn1: temp.pawn1, pawn2: temp.pawn2, pawn3: temp.pawn3, pawn4: temp.pawn4, pawn5: temp.pawn5, pawn6:temp.pawn6, pawn7: temp.pawn7, rook0: temp.rook0, rook1: temp.rook1, knight0: temp.knight0, knight1: temp.knight1, bishop0: temp.bishop0, bishop1: temp.bishop1, queen: temp.queen, king: temp.king};
        turnOpponent = this.state.player;
      }
    }
    return returnArray;
  }

  generateAbsoluteCover(tiles, color, state)
  {
    //the set of pieces for which we test each possible moves for
    let pieceSet = (color === this.state.player) ? {...state.playerPieces} : {...state.opponentPieces}
    let pieceSetCover = (color === this.state.player) ? {...state.playerPiecesCover} : {...state.opponentPiecesCover}

    const myIDs = this.state.myIDs;
    for(let i = 0; i < myIDs.length; i++){
      const currentID = myIDs[i];
      const currentCoord = pieceSet[currentID];
      if(currentCoord[0] === -1 || currentCoord[1] === -1)
      {
        pieceSetCover[currentID] = [];
        continue;
      }
      console.log('currentCoord',currentCoord)
      const currentUnfilteredCover = this.generateCoverByID(currentCoord[0], currentCoord[1], color, tiles, currentID, state);
      const currentFilteredCover = this.boardTest(tiles, currentUnfilteredCover, {data:tiles[currentCoord[0]][currentCoord[1]], row:currentCoord[0], col:currentCoord[1]}, state);
      pieceSetCover[currentID] = currentFilteredCover;
    }

    return pieceSetCover;
  }

  
}

export default CoverGenerator;