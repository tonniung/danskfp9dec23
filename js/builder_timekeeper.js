
(function (BuilderTimeKeeper, $, undefined) {

    var type = "visible";
    var currentMenuId = null;
    var menus = [];


    BuilderTimeKeeper.Init = function() {
        if(typeof $("body").attr("data-timekeeper") === "undefined") {
            return;
        }
        $('[data-timekeeper]:not(body)').each(function() {
            menus.push({
                id: $(this).attr("data-id"),
                startTime: null,
                totalTime: null
            });
        });
        $("#menu").on("click", function() {
            var menuId = GetActivePage().attr("data-id");
            StartTimer(menuId);
         
          
        });
        LoadTimes();
    };

    function GetActivePage() {
        var page = null;
        $('.PAGE').each(function() {
            if($(this).css("display") !== "none") {
                page = $(this);
            }

        });
        return page;
    }

    function StartTimer(menuId) {
        StopTimer(currentMenuId);
        currentMenuId = menuId;
        var menuIndex = GetMenuIndex(currentMenuId);
        if(menuIndex != -1) {
            menus[menuIndex].startTime = (new Date()).getTime();
        }
    }

    function StopTimer(currentMenuId) {
        if(currentMenuId === null) {
            // If no menu has been clicked yet, exit function.
            return;
        }
        var menuIndex = GetMenuIndex(currentMenuId);
        if(menuIndex == -1) {
            // if the menu items is not one we wanna time, exit function
            return;
        }
        if(menus[menuIndex].startTime === null) {
            // if no timer has been started yet, exit function.
            return;
        }
        var endDate = (new Date()).getTime();
        if(menus[menuIndex].totalTime === null) {
            menus[menuIndex].totalTime = 0;
        }
        menus[menuIndex].totalTime += endDate - menus[menuIndex].startTime;
        SaveTimes();
    }

    function SaveTimes() {
        customStorage.setItem(opg+"_timekeeper", JSON.stringify(BuilderTimeKeeper.GetData()));
    }

    function LoadTimes() {
        var data = customStorage.getItem(opg+"_timekeeper");
        if(data !== "") {
            data = JSON.parse(data);
            for(var i=0; i<data.length; i++) {
                var index = GetMenuIndex(data[i].id);
                menus[index].totalTime = data[i].totalTime;
            }
        }
    }

    function GetMenuIndex(id) {
        var output = -1;
        for(var i = 0; i<menus.length; i++) {
            if(menus[i].id == id) {
                output = i;
                break;
            }
        }
        return output;
    }

    BuilderTimeKeeper.GetData = function() {
        var returnData = [];
        for(var i=0; i<menus.length; i++) {
            returnData.push({
                id: menus[i].id,
                totalTime: menus[i].totalTime
            });
        }
        return returnData;
    };

}(window.BuilderTimeKeeper = window.BuilderTimeKeeper || {}, jQuery));