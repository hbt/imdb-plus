// example
//var q = '"bourne identity 2002 trailer"';
//         var url = 'http://www.youtube.com/results?search_query=' + q + '&search_type=&aq=f';
//          var xhr = new XMLHttpRequest();
//var mymoviesUrl = 'http://localhost:9092/index.php/';
//
//var url = 'http://localhost:9092/index.php/imdbplus/addToWatchlist?imdbId=252&username=232&passwd=123';
//var xhr = new XMLHttpRequest();
//
//console.log(url);
//
//xhr.open("GET", url, true);
//xhr.send();
//xhr.onreadystatechange = function()
//{
//    if (xhr.readyState == 4)
//    {
//        var content = xhr.responseText;
//
//        console.log(content);
//    }
//}
// end example ///
var mymoviesUrl = 'http://movies.voeb.ca/index.php/';
var username = localStorage['watcherUsername'];
var password = localStorage['watcherPassword'];
var myMovies = [];

var url = mymoviesUrl + 'imdbplus/list?username=' + username + '&password=' + password;
var xhr = new XMLHttpRequest();

log(localStorage);


if (localStorage['enablePrivateWatcher'] == "1")
{
    xhr.open("GET", url, true);
    xhr.send();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState == 4)
        {
            var content = xhr.responseText;
            myMovies = eval(content);
            log(myMovies);
            init();
        }
    }
} else
{
    init();
}

function init()
{
    chrome.extension.onRequest.addListener(function(request, sender, response)
        {
            if (request.getOptions)
            {
// retrieve extension options
                response(
                    {
                        'options': localStorage,
                        'myMovies': myMovies
                    }
                );
            } else if (request.q)
            {
// make a request to youtube and return results
                request.q = escape(request.q);
                var url = 'http://www.youtube.com/results?search_query=' + request.q;
                var xhr = new XMLHttpRequest();

                log(url);

                xhr.open("GET", url, true);
                xhr.send();
                xhr.onreadystatechange = function()
                {
                    if (xhr.readyState == 4)
                    {
                        var content = xhr.responseText;
                        var matches = content.match(/watch\?v=[\w|\b|\-]+/gi);
                        var videos = [];
                        var videoIds = new Array();
                        for (var i in matches)
                        {
                            var m = matches[i];

                            if (m != null && m != '' && m.indexOf('=') != -1 && m.length > 11)
                            {
                                var splitMatch = m.split('=');
                                if (splitMatch.length >= 2 && splitMatch[1].length == 11)
                                {
// TODO: retrieve title and add keyword search
                                    log(splitMatch[1]);
                                    videos[splitMatch[1]] = splitMatch[1];
                                    videoIds.push(splitMatch[1]);
                                }
                            }
                        }

                        log(videoIds);
// innerText does not let the attacker inject HTML elements.
                        response(
                            {
                                'videos': videoIds
                            }
                        );

                    }
                }
            } else if (request.getTorrents)
            {
// make google search for torrents and return results (limited to thepiratebay.org)
                var url = 'http://www.google.ca/search?sourceid=chrome&ie=UTF-8&q=' + escape(request.getTorrents) + '+site:thepiratebay.org';
                var xhr = new XMLHttpRequest();

                log(url);

                xhr.open("GET", url, true);
                xhr.send();
                xhr.onreadystatechange = function()
                {
                    if (xhr.readyState == 4)
                    {
                        var content = xhr.responseText;
                        var tmpdiv = document.createElement('div');
                        tmpdiv.innerHTML = content;
                        var links = tmpdiv.getElementsByTagName('A');

                        var responseLinks = new Array();
                        for (var i = 0; i < links.length; i++)
                        {
// retrieve the links from the search page (title + link)
                            var link = links[i];
                            if (link && link.innerHTML && link.href && link.href.indexOf('http://thepiratebay.org/torrent') != -1)
                            {
// remove the keywords highlighting
                                var cleanLinkInnerHTML = link.innerHTML.replace(/\<em\>/g, '');
                                cleanLinkInnerHTML = cleanLinkInnerHTML.replace(/\<\/em\>/g, '');

                                responseLinks.push(
                                    {
                                        href: link.href,
                                        title: cleanLinkInnerHTML
                                    }
                                );

                            }

                        }

                        log(responseLinks);
                        response(
                            {
                                'torrents': responseLinks
                            }
                        );


                    }
                }
            } else if (request.openTorrentsInNewWindow)
            {
// opens torrents in a new window
                var torrents = request.openTorrentsInNewWindow;
                log(torrents);
                chrome.windows.create(null, function(window)
                    {

                        for (var i in torrents)
                        {
                            var torrent = torrents[i];
// create new window
                            chrome.tabs.create(
                                {
                                    windowId: window.id,
                                    url: torrent.href
                                }
                            );


                        }
                    }
                );
            } else if (request.toggleWatchlist)
            {
                var imdbId = request.toggleWatchlist;
                var url = mymoviesUrl + 'imdbplus/toggleWatchlist?username=' + username + '&password=' + password + '&imdb_id=' + imdbId + '&title=' + request.title;
                var xhr = new XMLHttpRequest();

                log(url);

                xhr.open("GET", url, true);
                xhr.send();
                xhr.onreadystatechange = function()
                {
                    if (xhr.readyState == 4)
                    {
                        var content = xhr.responseText;
                        myMovies = eval(content);
                        response(
                            {
                                'myMovies': myMovies
                            }
                        );

                    }
                }
            } else if (request.toggleWatched)
            {
                var imdbId = request.toggleWatched;
                var url = mymoviesUrl + 'imdbplus/toggleWatched?username=' + username + '&password=' + password + '&imdb_id=' + imdbId + '&title=' + request.title;
                var xhr = new XMLHttpRequest();

                log(url);

                xhr.open("GET", url, true);
                xhr.send();
                xhr.onreadystatechange = function()
                {
                    if (xhr.readyState == 4)
                    {
                        var content = xhr.responseText;
                        myMovies = eval(content);
                        response(
                            {
                                'myMovies': myMovies
                            }
                        );

                    }
                }
            }
        }
    );
}

/*

function reloadme() { chrome.send('reload', ['egphdamhedkfjjlehdoedpidnpocghgk']); }; window.setInterval('reloadme()', 2000);

*/