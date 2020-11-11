
const board=[[],[],[],[],[],[],[]];
var tableElement = document.getElementById("gameTable");
var playE = document.getElementById("playmove")
var turnE = document.getElementById("turn")
var current_player = 1

const construct_board = () => {
    tableElement.innerHTML = '<tr style="text-align:center;"><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>'
    //for each row index
    //iterate through the columns and see whats in that index of the column
    for(var i=5; i>=0; i--) {
        html = '<tr>'
        board.forEach((col) => {
            if (col.length > i) {
                if (col[i] == '1') {
                    html += '<td><div class="red-piece"></div></td>'
                }
                else if (col[i] == '0') {
                    html += '<td><div class="black-piece"></div></td>'
                }
                else {
                    console.log('board[i] contains something other than 0 or 1')
                }
            }
            else {
                html += '<td><div class="spot"></div></td>'
            }
        })
        html += '</tr>'
        tableElement.innerHTML += html
    }
    if (current_player == 1) {
        turnE.innerHTML = 'red'
    }
    else {
        turnE.innerHTML = 'black'
    }
}


playE.addEventListener("click", (e) => {
    e.preventDefault()  
    var colnumInput = document.getElementById("colnum")
    var colnum = colnumInput.value
    board[colnum-1].push(current_player)
    move_depth_5(board, other_player(current_player))
    colnumInput.value = '';
    construct_board()
})




construct_board()



/////////////////////LOGIC////////////////////////
function clone(board) {
    let new_board = [[],[],[],[],[],[],[]]
    for (var i=0;i<7;i++) {
        var col = board[i]
        for (var j=0;j<col.length;j++) {
            new_board[i].push(col[j])
        }
    }
    return new_board
}

function contains_piece(board, coli, rowi, piece) {
    if (board.length >= coli+1 && coli >= 0) {
        if (board.length >= rowi+1 && rowi >= 0) {
            if (board[coli][rowi] == piece) {
                return true
            }
        }
    }
    return false;
}

function board_full(board) {
    for(var coli=0; coli<7; coli++) {
        var col = board[coli]
        if (!(col.length >= 6)) {
            return false;
        }
    }
    return true;
}

function game_over(board) {
    for (coli=0; coli<7; coli++) {
        var col = board[coli]
        for (rowi=0; rowi<col.length; rowi++) {
            var piece = col[rowi]
            if (contains_piece(board, coli, rowi+1, piece) && contains_piece(board, coli, rowi+2, piece) && contains_piece(board, coli, rowi+3, piece)) {
                return [true, piece, coli, rowi, 'vertical'];
            } 
            if (coli < 4) {
                if (contains_piece(board, coli+1, rowi, piece) && contains_piece(board, coli+2, rowi, piece) && contains_piece(board, coli+3, rowi, piece)) {
                    return [true, piece, coli, rowi, 'horizantel'];
                } 
            }
            if (rowi < 3) {
                if (coli < 4){
                    if (contains_piece(board, coli+1, rowi+1, piece) && contains_piece(board, coli+2, rowi+2, piece) && contains_piece(board, coli+3, rowi+3, piece)) {
                        return [true, piece, coli, rowi, 'diag forwards'];
                    } 
                }
                if (coli > 2){
                    if (contains_piece(board, coli-1, rowi+1, piece) && contains_piece(board, coli-2, rowi+2, piece) && contains_piece(board, coli-3, rowi+3, piece)) {
                        return [true, piece, coli, rowi, 'diag backwards'];
                    } 
                }
            }
        }
    }
    if (board_full(board)) {
        return [true, 2, 0, 0, 'tie']
    }
    return [false, 3, 0, 0, 'game not over']
}

function other_player(player) {
    if (player == 1) {
        return 0
    }
    else if (player == 0) {
        return 1
    }
    else {
        console.log('ERROR: other_player() recieved input that isnt 1 or 0')
    }
}

function two_three_in_a_rows(board, player) {
    var num_threes = 0
    for (var coli=0; coli<7; coli++) {
        var col = board[coli]
        var test_board = clone(board)
        test_board[coli].push(player)
        if (game_over(test_board)[1] == player) {
            num_threes += 1
        }
    }
    if (num_threes >= 2) {
        return true
    }
    else {
        return false
    }
}

function one_three_in_a_row(board, player) {
    for (var coli=0; coli<7; coli++) {
        test_board = clone(board)
        test_board[coli].push(player)
        if (game_over(test_board)[1] == player) {
            return coli
        }
    }
    return -1
}

function blocked_cols(player, board) {
    var blocked = 0
    for (var coli=0; coli<7; coli++) {
        var test_board = clone(board)
        test_board[coli].push(other_player(player))
        test_board[coli].push(player) 
        if (game_over(test_board)[1] == player) {
            blocked += 1
        }
    }
    return blocked
}

function score(board, player) {
    var final_score = 0
    var otherP = other_player(player)
    if (game_over(board)[1] == player) {
        return 500
    }
    else if (one_three_in_a_row(board, otherP) != -1) {
        final_score += -500
    }
    else if (two_three_in_a_rows(board, player)) {
        final_score += 200
    }
    else {
        var blocked = blocked_cols(player, board)
        var blocked_other = blocked_cols(otherP, board)
        if (blocked != 0) {
            final_score += 50*(blocked)
        }
        if (blocked_other != 0) {
            final_score += -50*(blocked)
        }
    }
    return final_score
}

function get_max_col(col_scores) {
    var max_score = -3000
    var possible_cols = []
    for (var coli=0; coli<7; coli++) {
        var score = col_scores[coli]
        if (score > max_score) {
            possible_cols = [coli]
            max_score = col_scores[coli]
        }
        else if (score == max_score) {
            possible_cols.push(coli)
        }
    }
    if (possible_cols.length == 1) {
        //console.log('1 move stood out')
        return possible_cols[0]
    }
    else {
        while (1 == 1) {
            //console.log('possible cols:')
            //console.log(possible_cols)
            var col = Math.floor(Math.random() * 7); 
            //console.log('random col: ' + col)
            if (possible_cols.includes(col)) {
                return col;
            }
        }
    }
}

function move_depth_1(board, player) {
    var col_scores = [-500,-500,-500,-500,-500,-500,-500]
    for (var coli=0; coli<7; coli++) {
        var test_board = clone(board)
        test_board[coli].push(player)
        if (board[coli].length < 6) {
            col_scores[coli] = score(test_board, player)
        }
    }
    var col = get_max_col(col_scores)
    return [col, col_scores[col]]
}


function move_depth_2(board, player) {
    var otherP = other_player(player)
    var best_col_1 = move_depth_1(board, otherP)
    var test_board = clone(board)
    test_board[best_col_1[0]].push(otherP)
    if (game_over(test_board)[1] == otherP) {
        //console.log('game is over')
        return -1000
    }
    var score_to_return = move_depth_1(test_board, player)[1]
    return score_to_return
}

function move_depth_3(board, player) {
    var col_scores = [-3000,-3000,-3000,-3000,-3000,-3000,-3000]
    for (var coli=0; coli<7; coli++) {
        var col = board[coli]
        if (col.length < 6) {
            var test_board = clone(board)
            test_board[coli].push(player)
            if (game_over(test_board)[1] == player) {
                col.push(player)
                return
            }
            var score = move_depth_2(test_board, player)
            col_scores[coli] = score
        }
    }
    //console.log(col_scores)
    var col_to_play = get_max_col(col_scores)
    board[col_to_play].push(player)
}

function move_depth_4(board, player) {
    var otherP = other_player(player)
    var test_board = clone(board)
    move_depth_3(test_board, otherP)
    if (game_over(test_board)[1] == otherP) {
        return -2000
    }
    else {
        move_depth_3(test_board, player)
        if (game_over(test_board)[1] == player) {
            return 1000
        }
        else {
            return move_depth_2(test_board, player)
        }
    }
}

function move_depth_5(board, player) {
    var col_scores = [-3000,-3000,-3000,-3000,-3000,-3000,-3000]
    var score = 0
    for (var coli=0; coli<7; coli++) {
        var col = board[coli]
        if (col.length < 6) {
            var test_board = clone(board)
            test_board[coli].push(player)
            if (game_over(test_board)[1] == player) {
                col_scores[coli] = 2000
            }
            else {
                score = move_depth_4(test_board, player)
                col_scores[coli] = score
            }
        }
    }
    var col_to_play = get_max_col(col_scores) 
    board[col_to_play].push(player)
}

