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

function removeAllChildNodes(parent) {
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
}

function readPageComment(destination) {
    $.ajax({
        url: "https://28a2lzj9k1.execute-api.us-east-2.amazonaws.com/read/" + getPageID(),
        type: "GET",
        crossDomain: true,
        success: function(result) {
            removeAllChildNodes(destination);
            let comments = JSON.parse(result)['comments'];
            if (comments.length == 0) {
                let p = document.createElement('p');
                p.setAttribute("style", "color:blue");
                p.textContent = "No comments yet";
                destination.appendChild(p);
            }
            else {
                comments.forEach(comment => {
                    let user = document.createElement('p');
                    user.setAttribute("style", "color:black");

                    let nickname = document.createElement('b');
                    nickname.textContent = comment['nickname'];
                    user.appendChild(nickname);

                    if (comment['sourceip'] != "") {
                        let sourceip = document.createElement('small');
                        sourceip.setAttribute("style", "color:gray");
                        sourceip.textContent = ` (${comment['sourceip']})`;
                        user.appendChild(sourceip);
                    }

                    let say = document.createElement('i');
                    say.textContent = " says";
                    user.appendChild(say);

                    let timestamp = document.createElement('p');
                    timestamp.setAttribute("style", "color:gray;font-size:10px");
                    timestamp.textContent = `@ ${comment['timestamp']}`;

                    let message = document.createElement('p');
                    message.setAttribute("style", "color:blue;margin-bottom:5px");
                    message.textContent = comment['comment'];

                    destination.appendChild(user);
                    destination.appendChild(timestamp);
                    destination.appendChild(message);
                })
            }
        }
    });
}

function sendPageComment(nickname, comment, destination) {
    let data = {"page_id":getPageID(),"comment":comment.value};
    if (nickname.value != "") {
        data['nickname'] = nickname.value;
    }
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

function readPageTag(destination) {
    $.ajax({
        url: "https://ts31palbs2.execute-api.us-west-2.amazonaws.com/read/" + getPageID(),
        type: "GET",
        crossDomain: true,
        success: function(result) {
            removeAllChildNodes(destination);
            let hashtags = JSON.parse(result)['hashtags'];
            if (hashtags.length == 0) {
                let p = document.createElement('p');
                p.setAttribute("style", "color:blue");
                p.textContent = "No tags yet";
                destination.appendChild(p);
            }
            else {
                hashtags.forEach(hashtag => {
                    let tag = document.createElement('b');
                    tag.setAttribute("style", "color:blue;font-weight:bold");
                    tag.textContent = `#${hashtag['hashtag']} `;

                    let popularity = document.createElement('span');
                    popularity.setAttribute("style", "color:gray");
                    popularity.textContent = `(${hashtag['popularity']})`;

                    let p = document.createElement('p');
                    p.appendChild(tag);
                    p.appendChild(popularity);
                    destination.appendChild(p);
                })
            }
        }
    });
}

function getValidTag(tag) {
    tag = tag.toLowerCase();
    tag = tag.replaceAll(' ', '');
    if (tag.slice(0) === '#') {
        tag = tag.slice(1);
    }
    return tag;
}

function sendPageTag(tag, destination) {
    let validTag = getValidTag(tag.value);
    if (validTag.length == 0) {
        return;
    }
    let data = {"page_id":getPageID(),"hashtag":validTag};
    $.ajax({
        url: "https://ts31palbs2.execute-api.us-west-2.amazonaws.com/write",
        type: "PUT",
        crossDomain: true,
        contentType: "application/json",
        data: JSON.stringify(data),
        success: function() {
            readPageTag(destination);
            tag.value=""
        }
    });
}

window.addEventListener('load', function() {
    $("body").append('                                                  \
      <div id="gmRightSideBar">                                         \
        <div id="sideBarTabs">                                          \
          <div id="pageCommentTab" class="sideBarTab">PageComment</div> \
          <div id="pageTagTab" class="sideBarTab">PageTag</div>         \
        </div>                                                          \
        </br>                                                           \
        <div id="pageCommentDiv">                                       \
          <div id="readCommentDiv" class="readContentDiv"/>             \
          </br>                                                         \
          <div id="writeCommentDiv">                                    \
            <input type="text"                                          \
                   id="pageCommentNickname"                             \
                   size=8                                               \
                   maxlength=15                                         \
                   value="Anonymous">                                   \
            <input type="text"                                          \
                   id="pageCommentInput"                                \
                   maxlength=50>                                        \
            <button id="pageCommentSend">Send</button>                  \
          </div>                                                        \
        </div>                                                          \
        <div id="pageTagDiv">                                           \
          <div id="readTagDiv" class="readContentDiv"/>                 \
          </br>                                                         \
            <input type="text"                                          \
                   id="pageTagInput"                                    \
                   maxlength=50>                                        \
            <button id="pageTagSend">Tag</button>                       \
          </div>                                                        \
        </div>                                                          \
      </div>                                                            \
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

    // PageComment
    document.getElementById("pageCommentTab").onclick = function() {
        if (document.getElementById("pageCommentDiv").style.display == "block") {
            return;
        }
        document.getElementById("pageCommentDiv").style.display = "block";
        document.getElementById("pageTagDiv").style.display = "none";
        readPageComment(document.getElementById("readCommentDiv"));
    }
    document.getElementById("readCommentDiv").style.maxHeight = window.innerHeight * 0.8 + 'px';
    document.getElementById("pageCommentSend").onclick = function() {
        sendPageComment(
            document.getElementById("pageCommentNickname"),
            document.getElementById("pageCommentInput"),
            document.getElementById("readCommentDiv")
        );
    }
    readPageComment(document.getElementById("readCommentDiv"));

    // PageTag
    document.getElementById("pageTagTab").onclick = function() {
        if (document.getElementById("pageTagDiv").style.display == "block") {
            return;
        }
        document.getElementById("pageTagDiv").style.display = "block";
        document.getElementById("pageCommentDiv").style.display = "none";
        readPageTag(document.getElementById("readTagDiv"));
    }
    document.getElementById("readTagDiv").style.maxHeight = window.innerHeight * 0.8 + 'px';
    document.getElementById("pageTagSend").onclick = function() {
        sendPageTag(
            document.getElementById("pageTagInput"),
            document.getElementById("readTagDiv")
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
        #pageTagInput {                                                 \
            background-color: #FED8B1;                                  \
            float: left;                                                \
        }                                                               \
        #pageCommentSend, #pageTagSend {                                \
            background-color: #FED8B1;                                  \
            float: right;                                               \
        }                                                               \
        .readContentDiv {                                               \
            overflow: auto;                                             \
        }                                                               \
        .readContentDiv::-webkit-scrollbar-track {                      \
	        -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,0.3);          \
	        background-color: #F5F5F5;                                  \
        }                                                               \
        .readContentDiv::-webkit-scrollbar {                            \
	        width: 10px;                                                \
	        background-color: #F5F5F5;                                  \
        }                                                               \
        .readContentDiv::-webkit-scrollbar-thumb {                      \
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
        .sideBarTab {                                                   \
            display: inline-block;                                      \
            width: 49%;                                                 \
            text-align: center;                                         \
        }                                                               \
        .sideBarTab:hover {                                             \
            color: red;                                                 \
        }                                                               \
        #pageTagDiv {                                                   \
            display: none;                                              \
        }                                                               \
    ");
}, false);