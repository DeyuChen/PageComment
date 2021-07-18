// ==UserScript==
// @name       Sidebar for Page Comments
// @version    0.1
// @description  Sidebar for Page Comments
// @match *://*/*
// @require http://code.jquery.com/jquery-latest.js
// @grant    GM_addStyle
// @noframes
// ==/UserScript==

function getPageID() {
    var page_id = (window.location.hostname + window.location.pathname).replaceAll('/', '$')
    return page_id;
}

function readPageComment(destination) {
    destination.load("https://28a2lzj9k1.execute-api.us-east-2.amazonaws.com/read/" + getPageID());
}

function sendPageComment(nickname, comment, destination) {
    let data = {"page_id":getPageID(),"comment":comment.value};
    if (nickname.value != "") {
        data['nickname'] = nickname.value;
    }
    console.log(JSON.stringify(data));
    $.ajax({
        url: "https://28a2lzj9k1.execute-api.us-east-2.amazonaws.com/write",
        type: "PUT",
        crossDomain: true,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function() {
            readPageComment(destination);
            comment.value=""
        }
    });
}

window.addEventListener('load', function() {
    $("body").append('                                                  \
        <div id="gmRightSideBar">                                       \
            <div id="readCommentDiv"/>                                  \
            </br>                                                       \
            <div id="writeCommentDiv">                                  \
                <input type="text"                                      \
                     id="pageCommentNickname"                           \
                     size=8                                             \
                     maxlength=15                                       \
                     value="Anonymous">                                 \
                <input type="text"                                      \
                     id="pageCommentInput"                              \
                     maxlength=50>                                      \
                <button                                                 \
                     id="pageCommentSend">Send</button>                 \
            </div>                                                      \
        </div>                                                          \
    ');

    //-- Fade panel when not in use
    var rightSideBar = $('#gmRightSideBar');
    rightSideBar.hover (
        function () {
            $(this).stop(true, false).fadeTo(50,  1);
        },
        function () {
            $(this).stop(true, false).fadeTo(900, 0);
        }
    );
    rightSideBar.fadeTo(2900, 0);

    document.getElementById("readCommentDiv").style.maxHeight = window.innerHeight * 0.8 + 'px';
    readPageComment($('#readCommentDiv'));
    document.getElementById("pageCommentSend").onclick = function() {
        sendPageComment(
            document.getElementById("pageCommentNickname"),
            document.getElementById("pageCommentInput"),
            $('#readCommentDiv')
        );
    }

    GM_addStyle("                                                       \
        #gmRightSideBar {                                               \
            position:               fixed;                              \
            top:                    0;                                  \
            right:                  0;                                  \
            margin:                 1ex;                                \
            padding:                1em;                                \
            background:             orange;                             \
            width:                  25%;                                \
            z-index:                6666;                               \
            opacity:                0.9;                                \
        }                                                               \
        #gmRightSideBar p {                                             \
            font-size:              80%;                                \
        }                                                               \
        #gmRightSideBar ul {                                            \
            margin:                 0ex;                                \
        }                                                               \
        #gmRightSideBar a {                                             \
            color:                  blue;                               \
        }                                                               \
        #pageCommentNickname {                                          \
            background-color: #FED8B1;                                  \
            float: left;                                                \
        }                                                               \
        #pageCommentInput {                                             \
            background-color: #FED8B1;                                  \
            float: left;                                                \
            margin-left: 5px                                            \
        }                                                               \
        #pageCommentSend {                                              \
            background-color: #FED8B1;                                  \
            float: right;                                               \
        }                                                               \
        #readCommentDiv {                                               \
            overflow: auto;                                             \
        }                                                               \
        #readCommentDiv::-webkit-scrollbar-track {                      \
	        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);          \
	        background-color: #F5F5F5;                                  \
        }                                                               \
        #readCommentDiv::-webkit-scrollbar {                            \
	        width: 10px;                                                \
	        background-color: #F5F5F5;                                  \
        }                                                               \
        #readCommentDiv::-webkit-scrollbar-thumb {                      \
	        background-color: #F90;	                                    \
	        background-image: -webkit-linear-gradient(45deg,            \
	            rgba(255, 255, 255, .2) 25%,                            \
				transparent 25%,                                        \
				transparent 50%,                                        \
				rgba(255, 255, 255, .2) 50%,                            \
				rgba(255, 255, 255, .2) 75%,                            \
				transparent 75%,                                        \
				transparent)                                            \
        }                                                               \
    ");
}, false);