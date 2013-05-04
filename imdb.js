// only run the script if we are on imdb
var url = window.location.href;

var movies = [];
var moviePageId = null;// used in the page while I figure out a better way with regex
log(url);
// movie page
var options = null;

var myMovies = [];

// retrieve options
chrome.extension.sendRequest(
    {
        getOptions: 'get'
    },

    function(response)
    {
        options = response.options;
        myMovies = response.myMovies;
        log(myMovies);
        log(options);
        init();
    }
);


// initialize

function init()
{
// for movie page
    if (url && url.indexOf('imdb') != -1 && url.indexOf('/title/tt') != -1)
    {
// retrieve movie title and year
        log("movie page " + url);
        var titleContainer = document.getElementById('tn15title');
        if (titleContainer)
        {
            var movieId = url.match(/\d+/);
            var movieName = titleContainer.childNodes[1].childNodes[0].textContent;
            var year = document.body.innerHTML.match(/Sections\/Years\/\d*/gi)[0].match(/\d+/);

            movies[movieId] =
            {
                'id': movieId,
                'year': year,
                'title': movieName
            };

            moviePageId = movieId;

            var header = titleContainer.firstChild;
            header.id = movieId;
            createActions(header, movieId);

// create actions next to link
            log(movies[movieId]);
// this is for recommendations
            retrieveLinks();
        }

// type of links we have to match
//h1 = "/title/tt0988045/";
//h2 = "/rg/tt-recs/link/title/tt0337593/";
//h3 = "/title/tt0988045/news";
//h4 = "/rg/title-tease/boards-subject/title/tt0988045/";
    }
// for other pages
    else if (url != undefined && url.indexOf('imdb') != -1 && document.body != null)
    {
// this is for any page
        retrieveLinks();
    }
}


// retrieves the links in the page and creates actions around

function retrieveLinks()
{

    var links = window.document.body.getElementsByTagName('A');
    for (var i in links)
    {
        var link = links[i];

// match link if it is a movie or a recommended movie
        if (link != undefined && link.href != null && link.href.match(/^http:\/\/www\.imdb\.[a-z]+?(\/rg\/tt-recs\/link)?\/title\/tt\d+\/$/) != null)
        {
            var movieId = link.href.match(/\d+/);

            if (movieId == null || (moviePageId != null && moviePageId == movieId)) continue;

            log(movieId[0]);
            var year = '';
            if (link.nextSibling != null) year = link.nextSibling.textContent.match(/\d+/);
            if (year == null || (year && year[0].length != 4)) year = '';
            var movieName = link.innerText;

            log(movieId + movieName + year);
// NOTE: we could improve this by using the (movies[movieId]) != null... but, some links link in nowplaying have images instead of innerText. So, query fails
            if (movieId == null || movieName == null) continue;

            movies[movieId] =
            {
                'id': movieId,
                'year': year,
                'title': movieName
            };


            createActions(link, movieId);


        }
    }
}

// create actions view trailers
// trailer + torrent action

function createActions(link, movieId)
{

// create span action with link inside
    var span = document.createElement('span');
    span.id = "actions-container-" + movieId;
    span.style.fontSize = "larger";
    span.style.textDecoration = '';
    span.style.cursor = '';

// trailer action
    var trailerAction = document.createElement('span');
    trailerAction.id = movieId;
    trailerAction.setAttribute('class', 'viewTrailers');
    trailerAction.innerText = "View Trailers";
    trailerAction.addEventListener("click", function(event)
        {
            updateTrailers(event.target.id);
        },
        false);


    if (options['enableTrailers'] == "1")
    {
        span.appendChild(trailerAction);
    }


// torrent action
    var torrentAction = document.createElement('span');
    torrentAction.id = 'torrents-action-' + movieId;
    torrentAction.setAttribute('class', 'viewTrailers');
    torrentAction.innerHTML = "&nbsp;&nbsp;View Torrents";
    torrentAction.addEventListener("click", function(event)
        {
            updateTorrents(movieId);
        },
        false);

    if (options['enableTorrents'] == "1")
    {
        span.appendChild(torrentAction);
    }


// add to watchlist
    var watchlistAction = document.createElement('span');
    watchlistAction.id = 'watchlist-action-' + movieId;
    watchlistAction.style.fontSize = "larger";
    watchlistAction.style.textDecoration = 'underline';
    watchlistAction.style.cursor = 'pointer';
//    watchlistAction.setAttribute('class', 'viewTrailers');
    if (myMovies[movieId] && myMovies[movieId].inWatchlist)
    {
        watchlistAction.innerHTML = "&nbsp;&nbsp;Remove from watchlist";
    } else
    {
        watchlistAction.innerHTML = "&nbsp;&nbsp;Add to watchlist";
    }
    watchlistAction.addEventListener("click", function(event)
        {
            toggleWatchlist(movieId);
        },
        false);

    if (options['enablePrivateWatcher'] == "1")
    {
        span.appendChild(watchlistAction);
    }


// add mark as watched
    var watchedAction = document.createElement('span');
    watchedAction.id = 'watched-action-' + movieId;
    watchedAction.style.fontSize = "larger";
    watchedAction.style.textDecoration = 'underline';
    watchedAction.style.cursor = 'pointer';
//    watchedAction.setAttribute('class', 'viewTrailers');
    if (myMovies[movieId] && myMovies[movieId].watched)
    {
        watchedAction.innerHTML = "&nbsp;&nbsp;Unmark as watched";
    } else
    {
        watchedAction.innerHTML = "&nbsp;&nbsp;Mark as watched";
    }
    watchedAction.addEventListener("click", function(event)
        {
            toggleWatched(movieId);
        },
        false);

    if (options['enablePrivateWatcher'] == "1")
    {
        span.appendChild(watchedAction);
    }


    link.parentElement.appendChild(span);

// div for torrents (torrents container)
    var torrentsContainer = document.createElement('div');
    torrentsContainer.id = "torrents-" + movieId;
    torrentsContainer.style.display = 'none';


// torrents (actual results)
    var torrents = document.createElement('div');
    torrents.id = 'torrents-results-' + movieId;
    torrentsContainer.appendChild(torrents);

// end of torrents
// begin of trailers
// div for trailer
    var trailerContainer = document.createElement('div');
    trailerContainer.id = "trailers-" + movieId;
    trailerContainer.style.display = 'none';

// close others trailers action
    var closeTrailers = document.createElement('div');
    closeTrailers.id = "trailers-close-others-action-" + movieId;
    closeTrailers.innerHTML = "#-- CLOSE other opened trailers";
    closeTrailers.style.textDecoration = 'underline';
    closeTrailers.style.cursor = 'pointer';
    closeTrailers.addEventListener("click", function(event)
        {
            closeOtherTrailers(movieId);
        },
        false);
    trailerContainer.appendChild(closeTrailers);

// trailers (videos container)
    var ytVideos = document.createElement('div');
    ytVideos.id = 'yt-videos-' + movieId;
    trailerContainer.appendChild(ytVideos);


    link.parentElement.appendChild(torrentsContainer);
    link.parentElement.appendChild(trailerContainer);

}


// watch functions here ///
// mark or unmark a movie as watched

function toggleWatched(movieId)
{
// make ajax call
    var movie = movies[movieId];
    var t = '';
    if (movies[movieId].title) t = movies[movieId].title;

    chrome.extension.sendRequest(
        {
            toggleWatched: movieId,
            title: t
        },


        function(response)
        {
// update UI
            myMovies = response.myMovies
            updateActionsUI();


        }
    );
}


// add or remove a movie from the watchlist

function toggleWatchlist(movieId)
{
// make ajax call
    var movie = movies[movieId];
    var t = '';
    if (movies[movieId].title) t = movies[movieId].title;


    chrome.extension.sendRequest(
        {
            toggleWatchlist: movieId,
            title: t
        },


        function(response)
        {
// update UI
            myMovies = response.myMovies
            updateActionsUI();


        }
    );
}

// update watched and inwatchlist actions based on myMovies

function updateActionsUI()
{
    for (var movieId in movies)
    {
        var myMovie = myMovies[movieId];
        log(movieId);
        log(myMovie);
        var watchlistAction = document.getElementById('watchlist-action-' + movieId);
        if (watchlistAction)
        {
            if (myMovie && myMovie.inWatchlist)
            {
                watchlistAction.innerHTML = "&nbsp;&nbsp;Remove from watchlist";
            } else
            {
                watchlistAction.innerHTML = "&nbsp;&nbsp;Add to watchlist";
            }
        }

        var watchedAction = document.getElementById('watched-action-' + movieId);
        if (watchedAction)
        {
            if (myMovie && myMovie.watched)
            {
                watchedAction.innerHTML = "&nbsp;&nbsp;Unmark as watched";
            } else
            {
                watchedAction.innerHTML = "&nbsp;&nbsp;Mark as watched";
            }
        }
    }
}

/// end myMovies actions ////
// open all torrents links from search results in a new window

function openAllTorrents(movieId)
{

    var torrents = movies[movieId].torrents;
    log(torrents);
    chrome.extension.sendRequest(
        {
            openTorrentsInNewWindow: torrents
        },


        function(response)
        {

        }
    );
}


function updateTorrents(movieId)
{
    var torrentsContainer = document.getElementById('torrents-' + movieId);
    if (torrentsContainer.style.display == 'block')
    {
        torrentsContainer.style.display = 'none';
        return;
    } else
    {
        torrentsContainer.style.display = 'block';
    }

// google query container (for search results)
    var queryContainer = document.getElementById('torrents-query-container-' + movieId);
    if (!queryContainer)
    {
        queryContainer = document.createElement('div');
        queryContainer.id = 'torrents-query-container-' + movieId;
        torrentsContainer.appendChild(queryContainer);
    }

// link to google search results
    var queryLink = document.getElementById('torrents-query-google-link-' + movieId);
    if (!queryLink)
    {
        queryLink = document.createElement('a');
        queryLink.id = 'torrents-query-google-link-' + movieId;
        queryLink.innerHTML = "view google search results";
        torrentsContainer.appendChild(queryLink);
    }


// link to piratebay search results
    var pirateQueryLink = document.getElementById('torrents-query-piratebay-link-' + movieId);
    if (!pirateQueryLink)
    {
        pirateQueryLink = document.createElement('a');
        pirateQueryLink.id = 'torrents-query-piratebay-link-' + movieId;
        pirateQueryLink.innerHTML = "&nbsp;&nbsp;&nbsp;view piratebay search results<br/><br/><br/>";


        torrentsContainer.appendChild(pirateQueryLink);

    }

    var query = movies[movieId].title.toLowerCase() + ' ' + movies[movieId].year;
    log(query);
    var queryContainer = document.getElementById('torrents-query-container-' + movieId);
    queryContainer.innerHTML = "Query: " + query;

    queryLink.href = 'http://www.google.ca/search?sourceid=chrome&ie=UTF-8&q=' + escape(query) + '+site:thepiratebay.org';


    pirateQueryLink.href = 'http://thepiratebay.org/search/' + escape(movies[movieId].title.toLowerCase()) + '/0/7/200';

// check if cached
    if (movies[movieId].torrents)
    {
        showCachedTorrents(movieId);
        return;
    }


    log(query);
// make request to youtube
    chrome.extension.sendRequest(
        {
            getTorrents: query
        },


        function(response)
        {
// get ids
// NOTE: temp structure until we retrieve the titles
            movies[movieId].torrents = response.torrents;
            showCachedTorrents(movieId);


        }
    );
}

function showCachedTorrents(movieId)
{
    var results = document.getElementById('torrents-results-' + movieId);
    results.innerHTML = '';
    var torrents = movies[movieId].torrents;
    for (var i in torrents)
    {
        var link = document.createElement('a');
        link.href = torrents[i].href;
        link.innerHTML = torrents[i].title;

        results.appendChild(link);
        results.appendChild(document.createElement('br'));
        results.appendChild(document.createElement('br'));
    }

    var openAllTorrentsLinksContainer = document.createElement('a');
    openAllTorrentsLinksContainer.innerHTML = "Open all torrents results in new window";
    openAllTorrentsLinksContainer.addEventListener("click", function(event)
        {
            openAllTorrents(movieId);
        },
        false);
    results.appendChild(openAllTorrentsLinksContainer);
}

/// end torrents functions ////
//// begin trailer functions ////
// loop and close trailer windows except for this one

function closeOtherTrailers(currentMovieId)
{
    for (movieId in movies)
    {
        if (movieId != currentMovieId)
        {
            var trailerContainer = document.getElementById('trailers-' + movieId);
            var ytVideos = document.getElementById('yt-videos-' + movieId);
            ytVideos.innerHTML = '';
            trailerContainer.style.display = 'none';

        }
    }
}

// calls youtube and updates trailer
// also toggles show/hide trailer container

function updateTrailers(movieId)
{
    var trailerContainer = document.getElementById('trailers-' + movieId);
    if (trailerContainer.style.display == 'block')
    {
        trailerContainer.style.display = 'none';
        return;
    } else
    {
        trailerContainer.style.display = 'block';
    }

// youtube query container
    var queryContainer = document.getElementById('trailers-query-container-' + movieId);
    if (!queryContainer)
    {
        queryContainer = document.createElement('div');
        queryContainer.id = 'trailers-query-container-' + movieId;
        trailerContainer.appendChild(queryContainer);

    }

// link to youtube search results
    var queryLink = document.getElementById('trailers-query-youtube-link-' + movieId);
    if (!queryLink)
    {
        queryLink = document.createElement('a');
        queryLink.id = 'trailers-query-youtube-link-' + movieId;
        queryLink.innerHTML = "view YouTube search results";
        trailerContainer.appendChild(queryLink);

    }


// build query
    var query = '"' + movies[movieId].title.toLowerCase() + '" ' + movies[movieId].year + " trailer";
    queryContainer.innerHTML = "Query: " + query;

// update link
    queryLink.href = 'http://www.youtube.com/results?search_query=' + escape(query);

// check if cached and build
    if (movies[movieId].videoIds)
    {
        showCachedVideos(movieId);
        return;
    }


    log(query);
// make request to youtube
    chrome.extension.sendRequest(
        {
            q: query
        },


        function(response)
        {
// get ids
// NOTE: temp structure until we retrieve the titles
            var videoIds = new Array();
            log(response.videos);
// build videos
            for (var i in response.videos)
            {
                videoIds[response.videos[i]] = response.videos[i];
            }
            movies[movieId].videoIds = videoIds;
            showCachedVideos(movieId);


        }
    );

// example of youtube embed code
//    var y = '<object width="480" height="385"><param name="movie" value="http://www.youtube.com/v/iLAK2IsQ_Uo&hl=en_US&fs=1&"></param><param name="allowFullScreen" value="true"></param><param name="allowscriptaccess" value="always"></param><embed src="http://www.youtube.com/v/iLAK2IsQ_Uo&hl=en_US&fs=1&" type="application/x-shockwave-flash" allowscriptaccess="always" allowfullscreen="true" width="480" height="385"></embed></object>';
}


// Note: improve caching by using an internal DB

function showCachedVideos(movieId)
{
    var videoIds = movies[movieId].videoIds;
    var ytVideos = document.getElementById('yt-videos-' + movieId);
    ytVideos.innerHTML = '';
    var limit = 0;
    for (var i in videoIds)
    {

        ytVideos.appendChild(createVideo(i));
        limit++;
        if (limit == options['limitVideos']) break;

    }
}

// creates video
// TODO: use swfobject to create and manipulate video

function createVideo(videoId)
{
    var o = document.createElement('object');
    o.width = options['youtubeWidth'];
    o.height = options['youtubeHeight'];

    var param1 = document.createElement('param');
    param1.setAttribute('name', 'movie');
    param1.setAttribute('value', 'http://www.youtube.com/v/' + videoId + '&hl=en_US&fs=1&');
    o.appendChild(param1);

    var param2 = document.createElement('param');
    param2.setAttribute('name', 'allowFullScreen');
    param2.setAttribute('value', 'true');
    o.appendChild(param2);

    var param3 = document.createElement('param');
    param3.setAttribute('name', 'allowscriptaccess');
    param3.setAttribute('value', 'always');
    o.appendChild(param3);

    var embed = document.createElement('embed');
    embed.setAttribute('src', 'http://www.youtube.com/v/' + videoId + '&hl=en_US&fs=1&');
    embed.setAttribute('type', 'application/x-shockwave-flash');
    embed.setAttribute('allowscriptaccess', 'always');
    embed.setAttribute('allowfullscreen', 'true');
    embed.setAttribute('width', options['youtubeWidth']);
    embed.setAttribute('height', options['youtubeHeight']);
    o.appendChild(embed);

    return o;
}

/// end trailer functions ///