var defaultOptions =
{
    "enableTrailers":
    {
      html: "Enable view trailers",
      defaultValue: 1,
      type: "checkbox"
    },
    "limitVideos":
    {
        html: "Limit videos to",
        defaultValue: 3
    },
    "youtubeWidth":
    {
        html: "YouTube video width",
        defaultValue: 640
    },
    "youtubeHeight":
    {
        html: "YouTube video height",
        defaultValue: 385
    },
    "enableTorrents":
    {
      html: "Enable View Torrents",
      defaultValue: 1,
      type: "checkbox"
    },
    "enablePrivateWatcher":
    {
      html: "Enable private watcher/notifier (At the moment, on invitation only)",
      defaultValue: 0,
      type: "checkbox"
    },
    "watcherUsername":
    {
      html: "Watcher username:",
      defaultValue: ""
    },
    "watcherPassword":
    {
      html: "Watcher password:",
      defaultValue: ""
    }

};


if (localStorage['limitVideos'] == undefined)
{
    for (var optionName in defaultOptions)
    {
        localStorage[optionName] = defaultOptions[optionName].defaultValue;
    }
}