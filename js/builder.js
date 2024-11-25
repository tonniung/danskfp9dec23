var saveFile = {};
var opg = "";

var customStorage = {
    setItem: function (key, value) {
    },
    getItem: function (key) {
        return "";
    },
    removeItem: function (key) {
    }
};
try {
    console.log("LOADING\tcustom storage using localstorage");
    if (typeof localStorage !== "undefined") {
        customStorage = {
            setItem: function (key, value) {
                value = CryptoJS.AES.encrypt(value, opg);
                localStorage.setItem(key, value);
            },
            getItem: function (key) {
                if (localStorage.getItem(key) !== null) {
                    decryptedBytes = CryptoJS.AES.decrypt(localStorage.getItem(key), opg);
                    return decryptedBytes.toString(CryptoJS.enc.Utf8);
                }
                return "";
            },
            removeItem: function (key) {
                return localStorage.removeItem(key);
            }
        };
    }
    console.log("OK\t\t\tcustom storage using localstorage");
}
catch (exception) {
    console.error("ERROR\tcustom storage using localstorage not working", exception);
    try {
        console.log("LOADING\tcustom storage using cookies");
        if (!navigator.cookieEnabled) {
            throw ("Cookies not enabled!");
        }
        customStorage = {
            setItem: function (key, value) {
                value = CryptoJS.AES.encrypt(value, opg);
                var date = new Date();
                date.setTime(date.getTime() + (2 * 24 * 60 * 60 * 1000));
                var expires = "; expires=" + date.toGMTString();
                document.cookie = key + "=" + value + expires + "; path=/";
            },
            getItem: function (key) {
                var nameEQ = key + "=";
                var ca = document.cookie.split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) === ' ') {
                        c = c.substring(1, c.length);
                    }
                    if (c.indexOf(nameEQ) === 0) {
                        return c.substring(nameEQ.length, c.length);
                    }
                }
                return "";
            },
            removeItem: function (key) {
                value = CryptoJS.AES.encrypt(value, opg);
                expires = "; expires=-1";
                document.cookie = key + "=" + expires + "; path=/";
            }
        };
        console.log("OK\t\t\tcustom storage using cookies");
    }
    catch (exception) {
        console.error("ERORR\tcustom storage using cookie not working", exception);
        (function (customStorage, $, undefined) {
            customStorage.setItem = function () {
            };
            customStorage.getItem = function () {
                return "";
            };
            customStorage.removeItem = function () {

            };
        }(window.customStorage = window.customStorage || {}, jQuery));
    }
}
function Hour(value) {
    return (60 * 60 * 1000) * value;
}

(function (Builder, $, undefined) {
    var MQ = null;
    var currentMQ = null;
    var resizeTimer = null;
    var saveThrottleTimer = 2000;
    var saveThrottle = null;
    var printStylesheet = null;
    var printStylesheetStyles = [];

    Builder.Init = function (callback) {
        $(function () {
            printStylesheet = $('<style></style>').appendTo($("head"));
            if (typeof $("body").attr("data-taskid") === "undefined" || $("body").attr("data-taskid") == "") {
                opg = $("body").attr("data-build-id");
            }
            else {
                opg = $("body").attr("data-taskid");
            }
            // CleanOldStorage();

            try {
                var d = new Date();
                d.setTime(d.getTime() + Hour(12));
                document.cookie = opg + "_key=" + opg + "$" + d.getTime() + "; expires=" + d.toUTCString() + "; path=/";
            }
            catch (exception) {
            }
            // customStorage.Init();

            if (callback) {
                callback();
            }
            SetupUnderlineWords();
            SetupFindReplaceWords();
            SetupDataItems();
            SetupExpandingTextarea();
            TrueSave();

            MathQuill = MathQuill.getInterface(1);
            MQ = MathQuill;
            SetupStaticEquations();
            SetupEquationLists();
            SetupEquations();
            $(window).on("resize", function () {
                ResizeEquations();
            });
            ResizeEquations();
            $(".wrapper .find-replace-words .input-find-replace.check input").trigger("input");
            hooks.PageLoaded.push(function (pageId) {
                ReflowEquations(pageId);
                setTimeout(function () {
                    autosize.update($('textarea[data-expand]'));
                    $(".wrapper .find-replace-words .input-find-replace.check input").trigger("input");
                }, 100);
            });
            PrintStyleCreate();
        });
    };

    Builder.ReadyToPrint = function (id) {
        var output = true;
        $('.PAGE[data-id="' + id + '"]').html("");
        $('[data-print-require-regex][data-print-require-message]').each(function () {
            var reg = new RegExp($(this).attr("data-print-require-regex"));
            if (!reg.test($(this).val())) {
                output = false;
                $('<p></p>').html($(this).attr("data-print-require-message")).appendTo($('.PAGE[data-id="' + id + '"]'));
            }
        });
        return output;
    };

    function CleanOldStorage() {
        try {
            if (typeof localStorage !== "undefined") {
                var prefix = opg + "_";
                var checkLength = prefix.length;
                var cookies = "; " + document.cookie;
                var index = cookies.indexOf("; " + prefix + "key=");
                if (index == -1) {
                    for (var x in localStorage) {
                        if (x.substr(0, checkLength) == prefix) {
                            customStorage.removeItem(x);
                        }
                    }
                }
            }
        }
        catch (exception) {

        }
    }

    function SetupUnderlineWords() {
        $(".underline-words").each(function () {
            var wordList = $(this).text().trim().split(" ").filter(function (el) {
                return el.length > 0;
            });
            var id = $(this).attr("id");
            var tempSpan = $('<span></span>');
            for (var i = 0; i < wordList.length; i++) {
                var word = wordList[i];
                var elementValue = "";
                var tempElement = $('<span class="underline-word"></div>').html('<span data-item id="' + id + '_' + i + '">' + word + '</span>').data("i", i).appendTo(tempSpan);
                if (i != wordList.length - 1) {
                    tempElement.append(' ');
                }
                if (customStorage.getItem(opg + "_" + id + '_' + i)) {
                    if (customStorage.getItem(opg + "_" + id + '_' + i) == "X") {
                        tempElement.addClass("active");
                        tempElement.children("span.hidden").html("X");
                    }
                }
                else {
                    customStorage.setItem(opg + "_" + id + '_' + i, "");
                }
                tempElement.on("click", function () {
                    var currentActive = $(this).hasClass("active");
                    $(this).closest(".underline-words").find(".underline-word").removeClass("active");
                    $(this).closest(".underline-words").find(".underline-word").children("span.hidden").html("");
                    $(this).closest(".underline-words").find(".underline-word").each(function () {
                        customStorage.setItem(opg + "_" + $(this).find("span[data-item]").attr("id"), "");
                    });
                    var i = $(this).data("i");
                    if (currentActive) {
                        $(this).removeClass("active");
                        $(this).children("span.hidden").html("");
                        customStorage.setItem(opg + "_" + id + '_' + i, "");
                    }
                    else {
                        $(this).addClass("active");
                        $(this).children("span.hidden").html("X");
                        customStorage.setItem(opg + "_" + id + '_' + i, "X");
                    }
                    Save();
                });
            }
            $(this).html("").append(tempSpan);
        });
    }

    /**
     * %%   - To make a locked solution use %% fx if the word "were" should be "was" you type were%%was
     * ^^   - To make a <sup> around a letter fx "he was born October 2^^n^^d"
     * **   - To make a <sub> around a letter fx "we all breath CO**2"
     * [[]] - To make a custom style on a word, define style inside {}. fx "source: [[]]{font-size:75%}Viking stronghold", here viking will be small
    */
    function SetupFindReplaceWords() {
        $('<span id="input-find-replace-size" class="input-find-replace-size"></span>').appendTo("body");
        $(".find-replace-words").each(function () {
            var increment = 0;
            function AddWord(tempDiv, word, elementValue) {
                var tempElement = $('<div class="input-find-replace"></div>').data("i", i).appendTo(tempDiv);
                var wordElm = $('<span class="input-find-replace-text">' + word + '</span>').appendTo(tempElement);
                $('<span>&nbsp;</span>').appendTo(tempElement);
                var hidden = $('<span class="hidden"></span>').appendTo(tempElement);
                if (customStorage.getItem(opg + "_" + id + '_' + i)) {
                    hidden.text(customStorage.getItem(opg + "_" + id + '_' + i));
                }
                var input = $('<input type="text" id="' + id + '_' + increment + '" class="inline-text" ' + elementValue + ' />').data({
                    "tempElement": tempElement,
                    "word": wordElm,
                    "storageId": opg + "_" + id + '_' + increment,
                    "i": i,
                    "hidden": hidden
                }).appendTo(tempElement).on("input", function () {
                    var sizeElm = $("#input-find-replace-size");
                    var wordElm = $(this).data("word");
                    var tempElement = $(this).data("tempElement");
                    sizeElm.html(wordElm.text());
                    var width = sizeElm.width();
                    sizeElm.html($(this).val());
                    if (sizeElm.width() > width) {
                        width = sizeElm.width();
                    }
                    width += 20;
                    $(this).css("width", width + "px");
                    tempElement.css("width", width + "px");
                    wordElm.css("width", width + "px");
                    hidden.css("width", width + "px");
                }).on("keyup", function () {
                    customStorage.setItem($(this).data("storageId"), $(this).val());
                    $(this).data("hidden").text($(this).val());
                });

                if (customStorage.getItem(opg + "_" + id + '_' + i)) {
                    var sizeElm = $("#input-find-replace-size");
                    var wordElm = input.data("word");
                    var tempElement = input.data("tempElement");
                    sizeElm.html(wordElm.text());
                    var width = sizeElm.width();
                    sizeElm.html(input.val());
                    if (sizeElm.width() > width) {
                        width = sizeElm.width();
                    }
                    width += 20;
                    input.css("width", width + "px");
                    tempElement.css("width", width + "px");
                    wordElm.css("width", width + "px");
                    hidden.css("width", width + "px");
                }


                if (wordList[i].indexOf("%%") == -1) {
                    tempElement.data({
                        "word": wordElm,
                        "input": input
                    }).on("click", function (e) {
                        var wordElm = $(this).data("word");
                        var input = $(this).data("input");

                        if (e.target.tagName == "INPUT") {
                            return;
                        }
                        var i = $(this).data("i");
                        if (!$(this).hasClass("check")) {
                            $(this).addClass("check");
                            input.trigger("input");
                        }
                        else {
                            $(this).removeClass("check");
                            $(this).children("input").val("");
                            $(this).children("span.hidden").html("");
                            customStorage.setItem(opg + "_" + id + '_' + increment, "");
                            $(this).css("width", "");
                            input.css("width", "");
                            wordElm.css("width", "");
                        }
                    });
                }
                if (wordList[i].indexOf("%%") != -1 || customStorage.getItem(opg + "_" + id + '_' + i)) {
                    tempElement.addClass("check");
                    if(wordList[i].indexOf("%%")) {
                        tempElement.find(".hidden").text(tempElement.find("input").val());
                    }
                }
                increment++;
            }
            var wordList = $(this).html().trim().split(" ").filter(function (el) {
                return el.length > 0;
            });
            var id = $(this).attr("id");
            var tempDiv = $('<div></div>');
            for (var i = 0; i < wordList.length; i++) {
                var word = wordList[i];
                var elementValue = "";
                var addBreak = false;
                if (wordList[i].indexOf("%%") != -1) {
                    var split = wordList[i].split("%%");
                    word = split[0];
                    elementValue = 'value="' + split[1] + '" readonly';
                }
                else if (wordList[i].indexOf("^^") != -1) {
                    var tempWord = word;
                    while (tempWord.indexOf("^^") != -1) {
                        var curIndex = tempWord.indexOf("^^");
                        tempWord = tempWord.substr(0, curIndex) + "<sup>" + tempWord.substr(curIndex + 2, 1) + "</sup>" + tempWord.substr(curIndex + 3);
                    }
                    word = tempWord;
                }
                else if (wordList[i].indexOf("**") != -1) {
                    var tempWord = word;
                    while (tempWord.indexOf("**") != -1) {
                        var curIndex = tempWord.indexOf("**");
                        tempWord = tempWord.substr(0, curIndex) + "<sub>" + tempWord.substr(curIndex + 2, 1) + "</sub>" + tempWord.substr(curIndex + 3);
                    }
                    word = tempWord;
                }
                else if (wordList[i].indexOf("[b]") != -1) {
                    var split = word.substr(3);
                    tempWord = split;
                    word = '<b>' + tempWord + "</b>";
                }
                else if (wordList[i].indexOf("[i]") != -1) {
                    var split = word.substr(3);
                    tempWord = split;
                    word = '<i>' + tempWord + "</i>";
                }
                else if (wordList[i].indexOf("[u]") != -1) {
                    var split = word.substr(3);
                    tempWord = split;
                    word = '<u>' + tempWord + "</u>";
                }
                else if (wordList[i].indexOf("[[]]") != -1) {
                    var split = word.substr(5).split("}");
                    tempWord = split[1];
                    word = '<span style="' + split[0] + '">' + tempWord + "</span>";
                }
                else if (wordList[i].indexOf("<br>") != -1) {
                    var split = word.split("<br>");
                    word = split[1];
                    addBreak = true;
                    AddWord(tempDiv, split[0].trim());
                }
                else if (customStorage.getItem(opg + "_" + id + '_' + i)) {
                    elementValue = 'value="' + customStorage.getItem(opg + "_" + id + '_' + i) + '"';
                }


                if (addBreak) {
                    tempDiv.append("<br>");
                }

                AddWord(tempDiv, word, elementValue);
            }
            $(this).html("").append(tempDiv);
        });
    }

    function SetupDataItems() {
        $("[data-svg-item]").each(function () {
            var id = $(this).attr("id");
            if ($(this).attr("type") == "checkbox") {
                var $this = $(this);
                var tempDiv = $('<div class="svg-checkbox"></div>').insertAfter($this);
                $this.on("change", function () {
                    tempDiv.click();
                });
                tempDiv.on("click", function (e) {
                    if ($(this).hasClass("checked")) {
                        $(this).removeClass("checked");
                        $this.prop("checked", false);
                        customStorage.setItem(opg + "_" + id, "");
                    }
                    else {
                        $(this).addClass("checked");
                        $this.prop("checked", true);
                        customStorage.setItem(opg + "_" + id, "x");
                    }
                });
                if (customStorage.getItem(opg + "_" + id)) {
                    var val = customStorage.getItem(opg + "_" + id);
                    if (val == "x") {
                        $(this).prop("checked", true);
                        tempDiv.addClass("checked");
                    }
                }
                else {
                    customStorage.setItem(opg + "_" + id, "");
                }
            }
            else {
                if (customStorage.getItem(opg + "_" + id)) {
                    var val = customStorage.getItem(opg + "_" + id);
                    $(this).html(val);
                }
                else {
                    customStorage.setItem(opg + "_" + id, "");
                }

                $(this).on("keyup", function (e) {
                    Save();
                });

                // var svg = $(this).closest("svg")[0];
                // $(this).data("svg", svg);

                // var input = $('<input type="text" style="position:fixed;left:-100000px;top:-1000000px;" />').data("text", $(this)).appendTo($("body"));
                // $(this).data("input", input);
                // var rect = $("#"+$(this).attr("id")+"-rect").data("text", $(this)).on("click", function() {
                //     var text = $(this).data("text");
                //     text.data("input").focus();
                // });

                // $(this).data("rect", rect);
                // $(this)[0].setAttribute("xml:space", "preserve");


                // var tspan = document.createElementNS("http://www.w3.org/2000/svg", 'tspan');
                // tspan.setAttributeNS("http://www.w3.org/XML/1998/namespace", "xml:space", "preserve");
                // tspan.setAttribute("font-size", "23");
                // tspan.setAttribute("y", "22");
                // tspan.setAttribute("font-family", "'Funktioner'");
                // tspan.textContent = "";
                // $(this)[0].appendChild(tspan);
                // $(this).data("tspan", tspan);
                // // var rect = $('<rect class="svg-item-rect" x="6.5" y="420" width="1200" height="23" style="stroke:rgba(0,0,0);stroke-width:2;fill:rgba(0,0,0,0);" />');
                // // var text = $('<tspan></tspan>');
                // // $(this)[0].innerHTML =rect.html() + text.html();
                // // $(this).data("rect", rect);
                // // <rect x="6.5" y="420" width="1200" height="23" style="stroke:rgba(0,0,0);stroke-width:2;fill:rgba(0,0,0,0);" />
                // input.on("keyup", function() {
                //     var text = $(this).data("text");
                //     var tspan = text.data("tspan");
                //     var val = $(this).val();
                //     // val = val.replace(/ /g, '<tspan dx="10"> </tspan>');
                //     tspan.innerHTML = val;
                // });
            }
        });
        $("[data-item]:not(.equation)").each(function () {
            var id = $(this).attr("id");
            if ($(this).attr("type") == "checkbox") {
                var tempT = $('<span class="hidden"></span>').insertAfter($(this));
                $('<label for="' + $(this).attr("id") + '" class="hide"></label>').insertAfter($(this));
                $(this).data("itemText", tempT);

                //#region Save to localstorage
                if (customStorage.getItem(opg + "_" + id)) {
                    var val = customStorage.getItem(opg + "_" + id);
                    if (val == "x") {
                        $(this).prop("checked", true);
                        $(this).data("itemText").html(val);
                        if ($(this).parent(".checkbox")) {
                            $(this).parent(".checkbox").attr("data-checked", true);
                        }
                    }
                }
                else {
                    customStorage.setItem(opg + "_" + id, "");
                    $(this).data("itemText").text("");
                }
                //#endregion

                $(this).on("change", function (e) {
                    var id = $(this).attr("id");
                    if ($(this).is(":checked")) {
                        $(this).data("itemText").text("x");
                        customStorage.setItem(opg + "_" + id, "x");
                    }
                    else {
                        $(this).data("itemText").text("");
                        customStorage.setItem(opg + "_" + id, "");
                    }
                    Save();
                });
            }
            else if ($(this)[0].tagName == "SELECT") {
                //#region span.hidden
                var size = "auto";
                var extraStyle = "";
                if (typeof $(this).attr("data-print-size") !== "undefined") {
                    size = $(this).attr("data-print-size");
                }
                if (typeof $(this).attr("data-font") !== "undefined") {
                    extraStyle = "font-family:'" + $(this).attr("data-font") + "';";
                }
                if (typeof $(this).attr("data-style") !== "undefined") {
                    extraStyle += $(this).attr("data-style");
                }
                var tempT = $('<span class="hidden" style="width:' + size + ';' + extraStyle + '"></span>').insertAfter($(this));
                if (typeof $(this).attr("data-class") !== "undefined") {
                    tempT.addClass($(this).attr("data-class"));
                }
                if ($(this).is("textarea")) {
                    tempT.addClass("textarea");
                }
                $(this).data("itemText", tempT);
                if (typeof $(this).attr("data-remove-html") !== "undefined") {
                    // $(this).removeAttr("data-remove-html");
                    tempT.attr("data-remove-html", "");
                }
                //#endregion

                if (typeof $(this).attr("data-item-style") !== "undefined") {
                    var styles = $(this).attr("data-item-style").split(";");
                    for (var i = 0; i < styles.length; i++) {
                        if (styles[i] != "") {
                            var tempStyle = styles[i].split(":");
                            tempT.css(tempStyle[0], tempStyle[1]);
                        }
                    }
                }

                //#region Save to localstorage
                if (customStorage.getItem(opg + "_" + id)) {
                    var val = customStorage.getItem(opg + "_" + id);
                    $(this).find("option").each(function () {
                        if ($(this).val() == val) {
                            $(this).prop("selected", true);
                        }
                    });
                    $(this).data("itemText").text(val);
                }
                else {
                    customStorage.setItem(opg + "_" + id, "");
                    if ($(this).val() !== "") {
                        $(this).data("itemText").text($(this).val());
                    }
                }
                //#endregion

                $(this).on("change", function (e) {
                    var id = $(this).attr("id");
                    var val = $(this).val();

                    $(this).data("itemText").html(val);
                    customStorage.setItem(opg + "_" + id, val);

                    Save();
                });
            }
            else if (typeof $(this).attr("data-rich") !== "undefined") {
                var id = $(this).attr("id");
                if (customStorage.getItem(opg + "_" + id) !== "") {
                    $(this).html(customStorage.getItem(opg + "_" + id));
                }

                function SpecialCharactersEmoji(editor) {
                    editor.plugins.get('SpecialCharacters').addItems('Emoji', [
                        { title: 'smiley face', character: '😊' },
                        { title: 'rocket', character: '🚀' },
                        { title: 'wind blowing face', character: '🌬️' },
                        { title: 'floppy disk', character: '💾' },
                        { title: 'heart', character: '❤️' }
                    ]);
                }

                var items = [
                    'undo',
                    'redo',
                    '|',
                    'bold',
                    'italic',
                    'underline',
                    'subscript',
                    'superscript',
                    '|',
                    'bulletedList',
                    'numberedList',
                    '|',
                    'specialcharacters'
                ];
                if (typeof $(this).attr("data-rich-toolbar") !== "undefined") {
                    items = $(this).attr("data-rich-toolbar").split(",");
                }

                var ckEditor = ClassicEditor
                    .create(this, {
                        toolbar: {
                            items: items
                        },
                        specialcharacters: [
                            SpecialCharactersEmoji
                        ],
                        language: 'da',
                        licenseKey: '',
                        autosave: {
                            save(editor) {
                                var id = $(editor.sourceElement).attr("id");
                                var val = editor.getData();
                                customStorage.setItem(opg + "_" + id, val);
                            }
                        }
                    })
                    .catch(error => {
                        console.error(error);
                    }).then(function (editor) {
                        $this = $(editor.sourceElement);
                        if (typeof $this.attr("data-word-count") !== "undefined") {
                            var tempWC = $('<span class="hidden word-count"></span>').insertAfter(editor.ui.view.element);
                            const wordCountPlugin = editor.plugins.get('WordCount');
                            $this.data({
                                "word-count": tempWC,
                                "word-count-plugin": wordCountPlugin
                            });
                            editor.editing.view.document.on("keyup", function (e) {
                                $(editor.sourceElement).data("word-count").html(wordCountPlugin.words);
                            });
                        }
                    });
            }
            else {
                //#region span.hidden
                var size = "auto";
                var extraStyle = "";
                if (typeof $(this).attr("data-print-size") !== "undefined") {
                    size = $(this).attr("data-print-size");
                }
                if (typeof $(this).attr("data-font") !== "undefined") {
                    extraStyle = "font-family:'" + $(this).attr("data-font") + "';";
                }
                if (typeof $(this).attr("data-style") !== "undefined") {
                    extraStyle += $(this).attr("data-style");
                }
                var tempT = $('<span class="hidden" style="width:' + size + ';' + extraStyle + '"></span>').insertAfter($(this));
                if (typeof $(this).attr("data-class") !== "undefined") {
                    tempT.addClass($(this).attr("data-class"));
                }
                if ($(this).is("textarea")) {
                    tempT.addClass("textarea");
                }
                $(this).data("itemText", tempT);
                if (typeof $(this).attr("data-remove-html") !== "undefined") {
                    // $(this).removeAttr("data-remove-html");
                    tempT.attr("data-remove-html", "");
                }
                //#endregion

                //#region word-count
                if (typeof $(this).attr("data-word-count") !== "undefined") {
                    var tempWC = $('<span class="hidden word-count"></span>').insertAfter($(this));
                    $(this).data("word-count", tempWC);
                }
                //#endregion

                if (typeof $(this).attr("data-item-style") !== "undefined") {
                    var styles = $(this).attr("data-item-style").split(";");
                    for (var i = 0; i < styles.length; i++) {
                        if (styles[i] != "") {
                            var tempStyle = styles[i].split(":");
                            tempT.css(tempStyle[0], tempStyle[1]);
                        }
                    }
                }
                //#endregion

                //#region Save to localstorage
                if (customStorage.getItem(opg + "_" + id)) {
                    var val = customStorage.getItem(opg + "_" + id);
                    $(this).val(val);
                    $(this).data("itemText").text(val);
                }
                else {
                    customStorage.setItem(opg + "_" + id, "");
                    if ($(this).val() !== "") {
                        $(this).data("itemText").text($(this).val());
                    }
                }
                //#endregion

                if (typeof $(this).attr("data-wordlist") !== "undefined") {
                    CheckWordList($(this).attr("data-wordlist"));
                }

                $(this).on("keyup input", function (e) {
                    var id = $(this).attr("id");
                    var val = $(this).val();

                    if (typeof $(this).attr("data-force-space") !== "undefined") {
                        val = val.replace(/ /g, "&nbsp;");
                    }
                    var wordlist = $(this).attr("data-wordlist");
                    if (typeof $(this).attr("data-remove-html") !== "undefined") {
                        $(this).data("itemText").html(val.replace(/\</g, '&lt;').replace(/\>/g, '&gt;'));
                    }
                    else {
                        $(this).data("itemText").html(val);
                    }
                    customStorage.setItem(opg + "_" + id, val);
                    if (typeof $(this).attr("data-wordlist") !== "undefined") {
                        CheckWordList(wordlist);
                    }
                    if (typeof $(this).attr("data-word-count") !== "undefined") {
                        if (typeof $(this).data("word-count")) {
                            $(this).data("word-count").html(WordCount(val));
                        }
                    }

                    Save();
                });
            }
        });

        $('[data-replace]').each(function () {
            // TODO: We need span hidden so it can be seen in print
            var id = $(this).attr("id");
            var $this = $(this).addClass("focus");
            var settings = JSON.parse($this.attr("data-replace"));
            let input = $('<input type="text" />').appendTo($this);


            //#region span.hidden
            var size = "auto";
            var extraStyle = "";
            if (typeof $(this).attr("data-print-size") !== "undefined") {
                size = $(this).attr("data-print-size");
            }
            if (typeof $(this).attr("data-font") !== "undefined") {
                extraStyle = "font-family:'" + $(this).attr("data-font") + "';";
            }
            if (typeof $(this).attr("data-style") !== "undefined") {
                extraStyle += $(this).attr("data-style");
            }
            var tempT = $('<span class="hidden" style="width:' + size + ';' + extraStyle + '"></span>').appendTo($this);
            if (typeof $(this).attr("data-class") !== "undefined") {
                tempT.addClass($(this).attr("data-class"));
            }
            if ($(this).is("textarea")) {
                tempT.addClass("textarea");
            }
            input.data("itemText", tempT);
            if (typeof $(this).attr("data-remove-html") !== "undefined") {
                // $(this).removeAttr("data-remove-html");
                tempT.attr("data-remove-html", "");
            }
            //#endregion



            var chars = '0123456789';
            var sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
            var sub = '₀₁₂₃₄₅₆₇₈₉';


            if (customStorage.getItem(opg + "_" + id)) {
                var val = customStorage.getItem(opg + "_" + id);
                input.val(val);
                input.data("itemText").text(val);
                if (typeof $this.attr("data-wordlist") !== "undefined") {
                    CheckWordList($this.attr("data-wordlist"));
                }
            }
            else {
                customStorage.setItem(opg + "_" + id, "");
                if ($(this).val() !== "") {
                    input.data("itemText").text(input.val());
                }
            }
            //#endregion

            input.on("keyup input", function () {
                let val = $(this).val();
                let update = false;
                if (settings.type == "Fysik") {
                    update = true;
                    val = $(this).val().replace(/[0-9]/g, function (x) {
                        var str = '';
                        var txt = $.trim(x);
                        for (var i = 0; i < txt.length; i++) {
                            var n = chars.indexOf(txt[i]);
                            str += (n != -1 ? sub[n] : txt[i]);
                        }
                        return str;
                    });
                }
                customStorage.setItem(opg + "_" + id, val);
                if (typeof $this.attr("data-wordlist") !== "undefined") {
                    CheckWordList($this.attr("data-wordlist"));
                }
                if (update) {
                    $(this).val(val);
                    $(this).data("itemText").html(val);
                }
            });

            // var id = $(this).attr("id");
            // var $this = $(this);
            // var settings = JSON.parse($this.attr("data-replace"));
            // let value = $('<div></div>').appendTo($this);
            // let input = $('<input type="text" />').appendTo($this);

            // input.on("focus", function() {
            //     $this.addClass("focus");
            // }).on("keydown", function(e) {
            //     setTimeout(function() {
            //         $(this).trigger("focus");
            //     }, 10);
            //     // console.log("keydown");
            //     // $this.addClass("focus");
            //     // if(e.keyCode == 9 && e.shiftKey) {
            //     //     // e.preventDefault();
            //     //     // $('.wrapper [data-replace-prev="' + settings.prevTab + '"]').trigger("focus");
            //     // }
            // }).on("keyup", function() {
            //     console.dir(input.is(":focus"))
            //     let rawVal = $(this).val();
            //     let val = StripHtml(rawVal);
            //     console.log("keyup", $(this).val(), "|"+val+"|");
            //     customStorage.setItem(opg + "_" + id, val);
            //     if(typeof $this.attr("data-wordlist") !== "undefined") {
            //         CheckWordList($this.attr("data-wordlist"));
            //     }
            // }).on("blur", function() {
            //     console.log("blur");
            //     let rawVal = $(this).val();
            //     let val = StripHtml(rawVal);
            //     input.val(val);
            //     // let val = $(this).val().replace(" ", "&nbsp;");
            //     if(settings.type == "Fysik") {
            //         // val = val.replace(/[0-9]+/g, '<sub style="line-height: 0.4em;">$&</sub>');
            //     }
            //     value.html(val);
            //     $this.removeClass("focus");
            // });
            // $(this).on("click focus", function(e) {
            //     e.preventDefault();
            //     $(this).addClass("focus");
            //     setTimeout(function() {
            //         input.trigger("focus");
            //     }, 100);
            // });

            setTimeout(function () {
                if (customStorage.getItem(opg + "_" + id)) {
                    input.val(customStorage.getItem(opg + "_" + id)).trigger("blur");
                    // value.html(customStorage.getItem(opg + "_" + id));
                    if (typeof $this.attr("data-wordlist") !== "undefined") {
                        CheckWordList($this.attr("data-wordlist"));
                    }
                }
                else {
                    customStorage.setItem(opg + "_" + id, "");
                }
            }, 1);
        });
        // $(".equation[data-item][data-print-size]").each(function() {
        //     $(this).css("width", $(this).attr("data-print-size"));
        // });
        $("[data-print-size]").each(function () {
            AddPrintStyle('[data-print-size="' + $(this).attr("data-print-size") + '"]', [
                {
                    key: "width",
                    value: $(this).attr("data-print-size") + "!important"
                }
            ]);
            // $(this).css("width", $(this).attr("data-print-size"));
        });
    }

    function StripHtml(html) {
        let doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    }

    function WordCount(text) {
        var wordcount = 0;
        if (text !== "") {
            var wordSplit = text.replace(/\s{2,10}/g, ' ').split(" ").filter(function (value) {
                return value != "";
            });
            wordcount = wordSplit.length;
        }

        return wordcount;
    }

    function AddPrintStyle(key, values) {
        if (!PrintStyleExists(key)) {
            printStylesheetStyles.push({
                key: key,
                values: values
            });
        }
    }

    function PrintStyleExists(key) {
        var output = false;
        for (var i = 0; i < printStylesheetStyles.length; i++) {
            if (printStylesheetStyles[i].key == key) {
                output = true;
                break;
            }
        }
        return output;
    }

    function PrintStyleCreate() {
        var output = "@media print {";
        for (var i = 0; i < printStylesheetStyles.length; i++) {
            output += printStylesheetStyles[i].key + "{";
            for (var k = 0; k < printStylesheetStyles[i].values.length; k++) {
                output += printStylesheetStyles[i].values[k].key + " : " + printStylesheetStyles[i].values[k].value + ";";
            }
            output += "}";
        }

        output += "}";
        printStylesheet.text(output);
    }

    function SetupExpandingTextarea() {
        autosize($('textarea[data-expand]'));
    }

    Builder.CallSave = function () {
        TrueSave();
    };

    function Save() {
        // clearTimeout(saveThrottle);
        // saveThrottle = setTimeout(function() {
        //     TrueSave();
        // }, saveThrottleTimer);
    }

    function TrueSave() {
        $("#builder").remove();
        var result = {
            "Rest": []
        };
        $('[data-word-count]').each(function () {
            if (typeof $(this).attr("data-rich") !== "undefined") {
                if (typeof $(this).data("word-count-plugin") !== "undefined") {
                    $(this).data("word-count").html($(this).data("word-count-plugin").words);
                }
            }
            else {
                if (typeof $(this).data("word-count") !== "undefined" && $(this).data("word-count") !== "") {
                    $(this).data("word-count").html(WordCount($(this).val()));
                }
            }
        });
        $('[data-result]').each(function () {
            var type = "Rest";
            if (typeof $(this).attr("data-group") !== "undefined") {
                type = $(this).attr("data-group");
                if (!result.hasOwnProperty(type)) {
                    result[type] = {
                        items: [],
                        weight: typeWeight[type]
                    };
                }
            }
            var data = {
                name: $(this).attr("data-result"),
                value: $(this).html().trim(),
                wrap: null,
            };
            if (typeof $(this).attr("data-wrap") !== "undefined") {
                data.wrap = $(this).attr("data-wrap");
            }
            result[type].items.push(data);
        });

        var techinfo = null;
        if ($("#tech-info").length == 0) {
            techinfo = $('<div id="tech-info" style="position:absolute;bottom:0;padding:20px 0;color:#ccc;"></div>').appendTo($("[data-frontpage]"));
        }
        else {
            techinfo = $("#tech-info");
        }
        techinfo.html("");
        $('<span></span>').html("UA:" + navigator.userAgent).appendTo(techinfo);

        var html = $('<div id="builder"></div>');
        $('<div style="page-break-after:always;position:relative;height:100vh;" data-weight="0"></div>').html($('[data-frontpage]').html()).appendTo(html);
        var index = 0;
        $.each(result, function (key, value) {
            if (value.length == 0) {
                return true;
            }
            var table = $('<table style="width:100%;page-break-after:always;" data-weight="' + value.weight + '"></table>').appendTo(html);

            // Add header if there is any
            var header = $('[data-header]');
            if (header.length > 0) {
                var thead = $('<thead style="background-color:#eceded;"></thead>').appendTo(table);
                var theadTr = $('<tr></tr>').appendTo(thead);
                var theadTd = $('<td colspan="2"></td>').appendTo(theadTr);
                var theadTable = $('<table style="width:100%;height:40px;" class="table"></table>').appendTo(theadTd);
                var theadTableTr = $('<tr></tr>').appendTo(theadTable);
                header.find('[data-header-item]').each(function () {
                    var title = $(this).attr("data-header-item");
                    var value = $(this).val();
                    $('<td style="vertical-align:top;position:relative;font-size:14px;word-break:break-all;padding-top:20px;min-width:40px;"></td>').html('<span class="header-title">' + title + '</span>' + value).appendTo(theadTableTr);
                });
            }

            // Add content
            var tbody = $('<tbody></tbody>').appendTo(table);
            $('<tr></tr>').html('<th colspan="2"><h2>' + key + '</h2></th>').appendTo(tbody);
            $('<tr></tr>').html('<td><b>Opgave</b></td><td><b>Svar</b></td>').appendTo(tbody);
            for (var i = 0; i < value.items.length; i++) {
                var tempVal = value.items[i].value;
                if (value.items[i].name == "3.1" || value.items[i].name == "3.2") {
                    if (value.items[i].wrap !== null) {
                        var wrapElement = value.items[i].wrap.split(" ")[0];
                        var wrapAttributes = value.items[i].wrap.substr(wrapElement.length);
                        tempVal = "<" + wrapElement + " " + wrapAttributes + ">" + tempVal + "</" + wrapElement + ">";
                    }
                }
                $('<tr></tr>').html('<td style="vertical-align:top;">' + value.items[i].name + '</td><td>' + tempVal + '</td>').appendTo(tbody);
            }
        });
        html.find("[data-remove-html]").each(function () {
            $(this).html($(this).html().replace(/\</g, '&lt;').replace(/\>/g, '&gt;'));
        });

        if (typeof BuilderTimeKeeper !== "undefined") {
            var timeKeeper = BuilderTimeKeeper.GetData();
            if (timeKeeper.length > 0) {
                var timeKeeperTable = $('<table style="width:100%;page-break-after:always;" data-weight="10000"></table>').appendTo(html);

                // Add header if there is any
                var header = $('[data-header]');
                if (header.length > 0) {
                    var thead = $('<thead style="background-color:#eceded;"></thead>').appendTo(timeKeeperTable);
                    var theadTr = $('<tr></tr>').appendTo(thead);
                    var theadTd = $('<td colspan="2"></td>').appendTo(theadTr);
                    var theadTable = $('<table style="width:100%;height:40px;" class="table"></table>').appendTo(theadTd);
                    var theadTableTr = $('<tr></tr>').appendTo(theadTable);
                    header.find('[data-header-item]').each(function () {
                        var title = $(this).attr("data-header-item");
                        var value = $(this).val();
                        $('<td style="vertical-align:top;position:relative;font-size:14px;word-break:break-all;padding-top:20px;min-width:40px;"></td>').html('<span class="header-title">' + title + '</span>' + value).appendTo(theadTableTr);
                    });
                }

                var timeKeeperTbody = $('<tbody></tbody>').appendTo(timeKeeperTable);
                $('<tr></tr>').html('<th colspan="2"><h2>Tid Brugt</h2></th>').appendTo(timeKeeperTbody);
                $('<tr></tr>').html('<td><b>Opgave</b></td><td><b>Tid</b></td>').appendTo(timeKeeperTbody);
                for (var i = 0; i < timeKeeper.length; i++) {
                    var pageName = $('.PAGE[data-id="' + timeKeeper[i].id + '"]').attr("data-menutekst");
                    var time = PrettifyMs(timeKeeper[i].totalTime);
                    $('<tr></tr>').html('<td style="vertical-align:top;">' + pageName + '</td><td>' + time + '</td>').appendTo(timeKeeperTbody);
                }
            }

            $("body").append(html);
            $("#builder > [data-weight]").sort(function (a, b) {
                return ($(b).attr("data-weight")) < ($(a).attr("data-weight")) ? 1 : -1;
            }).appendTo('#builder');
        }
    }

    function CheckWordList(item) {
        var wordlist = $('.word-list[data-handle="' + item + '"]');
        var type = "strict";
        var chars = '0123456789';
        var sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';
        var sub = '₀₁₂₃₄₅₆₇₈₉';
        if (typeof wordlist.attr("data-wordlist-type") !== "undefined") {
            type = wordlist.attr("data-wordlist-type");
        }
        if (wordlist.length > 0) {
            var answerList = $('[data-wordlist="' + item + '"]').map(function () {
                if (typeof $(this).attr("data-replace") !== "undefined") {
                    if ($(this).find("input").length > 0) {
                        return $(this).find("input").val().toLowerCase();
                    }
                }
                else {
                    return this.value.toLowerCase();
                }
            }).get();
            $('.word-list[data-handle="' + item + '"] ul li:not(.skip)').each(function () {
                var found = false;
                var inputText = $(this).text();
                var inputText2 = inputText.replace(/[0-9]/g, function (x) {
                    var str = '';
                    var txt = $.trim(x);
                    for (var i = 0; i < txt.length; i++) {
                        var n = chars.indexOf(txt[i]);
                        str += (n != -1 ? sub[n] : txt[i]);
                    }
                    return str;
                });
                if (inputText !== "") {
                    if (type == "strict") {
                        for (var i = 0; i < answerList.length; i++) {
                            if (answerList[i].toLowerCase() == inputText.toLowerCase() || answerList[i].toLowerCase() == inputText2.toLowerCase()) {
                                found = true;
                                break;
                            }
                        }
                    }
                    else if (type == "any") {
                        for (var i = 0; i < answerList.length; i++) {
                            if (answerList[i].indexOf(inputText.toLowerCase()) != -1) {
                                found = true;
                                break;
                            }
                        }
                    }
                }
                if (found) {
                    $(this).addClass("check");
                }
                else {
                    $(this).removeClass("check");
                }
            });
        }
    }

    function SetupEquationLists() {
        $(".equation-list").each(function () {
            var id = $(this).attr("id");
            var equationList = $(this);
            var equations = [];
            var equationsListButtonsContainer = $('<div class="equation-list-toolbar"></div>').appendTo($(this));
            $('<a href="#" class="equation-list-toolbar-btn"></a>').html("Tilføj linie").appendTo(equationsListButtonsContainer).on("click", function (e) {
                e.preventDefault();
                CreateEquationListItem(equationList, "");
                SaveEquationList(equationList);
            });
            if (customStorage.getItem(opg + "_" + id)) {
                equations = JSON.parse(customStorage.getItem(opg + "_" + id));
            }
            if (equations.length > 0) {
                for (var i = 0; i < equations.length; i++) {
                    CreateEquationListItem(equationList, equations[i]);
                }
            }
            else {
                CreateEquationListItem(equationList, "");
            }
        });
    }

    function CreateEquationListItem(equationList, value) {
        var id = equationList.attr("id");
        var tempEquationContainer = $('<div class="equation-list-item-container"></div>').appendTo(equationList);
        $('<a href="#" class="equation-list-item-delete">-</a>').appendTo(tempEquationContainer).on("click", function (e) {
            e.preventDefault();
            tempEquationContainer.remove();
            SaveEquationList(equationList);
        });
        var tempEquation = $('<span class="equation-list-item">' + value + '</span>').appendTo(tempEquationContainer);
        var answerMathField = MQ.MathField(tempEquation[0], {
            handlers: {
                edit: function () {
                    if (typeof answerMathField !== "undefined") {
                        var enteredMath = answerMathField.latex();
                        SaveEquationList(equationList);
                    }
                }
            }
        });
    }

    function ResizeEquations() {
        clearTimeout(resizeTimer);
        $(".equation-list").css("display", "none");
        resizeTimer = setTimeout(function () {
            var newWidth = ($(".wrapper").outerWidth() * 0.82) - 12 - 30;
            $(".equation-list").css({
                "width": newWidth + "px",
                "display": "inline-block"
            });
        }, 300);
    }

    function SaveEquationList(equationList) {
        var id = equationList.attr("id");
        var equations = [];
        equationList.children(".equation-list-item-container").each(function () {
            equations.push(MQ($(this).children('.equation-list-item')[0]).latex());
        });
        customStorage.setItem(opg + "_" + id, JSON.stringify(equations));
        Save();
    }

    function SetupEquations() {
        $(".equation").each(function () {
            var id = $(this).attr("id");
            var $this = $(this);
            if (customStorage.getItem(opg + "_" + id)) {
                $this.html(customStorage.getItem(opg + "_" + id));
            }
            var answerMathField = MQ.MathField($(this)[0], {
                handlers: {
                    edit: function () {
                        if (typeof answerMathField !== "undefined") {
                            var enteredMath = answerMathField.latex();
                            customStorage.setItem(opg + "_" + id, enteredMath);
                            Save();
                        }
                    }
                }
            });
            $(this).on("focus", "textarea", function () {
                currentMQ = $this;
            });
            // CreateButtons(answerMathField);
        });
    }

    function PrettifyMs(value) {
        var output = "";
        if (value === null) {
            value = 0;
        }
        var seconds = Math.floor(value / 1000);
        var hours = Math.floor(seconds / 3600);
        seconds -= hours * 3600;
        var minutes = Math.floor(seconds / 60);
        seconds -= minutes * 60;
        if (hours > 0) {
            output = hours + " time";
            if (hours > 1) {
                output += "r";
            }
            output += ", ";
        }
        if (hours > 0 || minutes > 0) {
            output += minutes + " minut";
            if (minutes > 1 || minutes == 0) {
                output += "ter";
            }
            output += " og ";
        }
        output += seconds + " sekund";
        if (seconds > 1 || seconds == 0) {
            output += "er";
        }
        return output;
    }

    function SetupStaticEquations() {
        $(".static-equation").each(function () {
            MQ.StaticMath($(this)[0]);
        });
    }

    function ReflowEquations(pageId) {
        setTimeout(function () {
            $('.PAGE[data-id="' + pageId + '"] .equation').each(function () {
                var mathField = MQ.MathField($(this)[0]);
                mathField.reflow();
            });
        }, 100);
    }


}(window.Builder = window.Builder || {}, jQuery));

//#region Text resize
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', 'exports'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, exports);
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, mod.exports);
        global.autosize = mod.exports;
    }
})(this, function (module, exports) {
    'use strict';

    var map = typeof Map === "function" ? new Map() : function () {
        var keys = [];
        var values = [];

        return {
            has: function has(key) {
                return keys.indexOf(key) > -1;
            },
            get: function get(key) {
                return values[keys.indexOf(key)];
            },
            set: function set(key, value) {
                if (keys.indexOf(key) === -1) {
                    keys.push(key);
                    values.push(value);
                }
            },
            delete: function _delete(key) {
                var index = keys.indexOf(key);
                if (index > -1) {
                    keys.splice(index, 1);
                    values.splice(index, 1);
                }
            }
        };
    }();

    var createEvent = function createEvent(name) {
        return new Event(name, { bubbles: true });
    };
    try {
        new Event('test');
    } catch (e) {
        // IE does not support `new Event()`
        createEvent = function createEvent(name) {
            var evt = document.createEvent('Event');
            evt.initEvent(name, true, false);
            return evt;
        };
    }

    function assign(ta) {
        if (!ta || !ta.nodeName || ta.nodeName !== 'TEXTAREA' || map.has(ta)) return;

        var heightOffset = null;
        var clientWidth = null;
        var cachedHeight = null;

        function init() {
            var style = window.getComputedStyle(ta, null);

            if (style.resize === 'vertical') {
                ta.style.resize = 'none';
            } else if (style.resize === 'both') {
                ta.style.resize = 'horizontal';
            }

            if (style.boxSizing === 'content-box') {
                heightOffset = -(parseFloat(style.paddingTop) + parseFloat(style.paddingBottom));
            } else {
                heightOffset = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
            }
            // Fix when a textarea is not on document body and heightOffset is Not a Number
            if (isNaN(heightOffset)) {
                heightOffset = 0;
            }

            update();
        }

        function changeOverflow(value) {
            {
                // Chrome/Safari-specific fix:
                // When the textarea y-overflow is hidden, Chrome/Safari do not reflow the text to account for the space
                // made available by removing the scrollbar. The following forces the necessary text reflow.
                var width = ta.style.width;
                ta.style.width = '0px';
                // Force reflow:
                /* jshint ignore:start */
                ta.offsetWidth;
                /* jshint ignore:end */
                ta.style.width = width;
            }

            ta.style.overflowY = value;
        }

        function getParentOverflows(el) {
            var arr = [];

            while (el && el.parentNode && el.parentNode instanceof Element) {
                if (el.parentNode.scrollTop) {
                    arr.push({
                        node: el.parentNode,
                        scrollTop: el.parentNode.scrollTop
                    });
                }
                el = el.parentNode;
            }

            return arr;
        }

        function resize() {
            if (ta.scrollHeight === 0) {
                // If the scrollHeight is 0, then the element probably has display:none or is detached from the DOM.
                return;
            }

            var overflows = getParentOverflows(ta);
            var docTop = document.documentElement && document.documentElement.scrollTop; // Needed for Mobile IE (ticket #240)

            ta.style.height = '';
            ta.style.height = ta.scrollHeight + heightOffset + 'px';

            // used to check if an update is actually necessary on window.resize
            clientWidth = ta.clientWidth;

            // prevents scroll-position jumping
            overflows.forEach(function (el) {
                el.node.scrollTop = el.scrollTop;
            });

            if (docTop) {
                document.documentElement.scrollTop = docTop;
            }
        }

        function update() {
            resize();

            var styleHeight = Math.round(parseFloat(ta.style.height));
            var computed = window.getComputedStyle(ta, null);

            // Using offsetHeight as a replacement for computed.height in IE, because IE does not account use of border-box
            var actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(computed.height)) : ta.offsetHeight;

            // The actual height not matching the style height (set via the resize method) indicates that 
            // the max-height has been exceeded, in which case the overflow should be allowed.
            if (actualHeight < styleHeight) {
                if (computed.overflowY === 'hidden') {
                    changeOverflow('scroll');
                    resize();
                    actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
                }
            } else {
                // Normally keep overflow set to hidden, to avoid flash of scrollbar as the textarea expands.
                if (computed.overflowY !== 'hidden') {
                    changeOverflow('hidden');
                    resize();
                    actualHeight = computed.boxSizing === 'content-box' ? Math.round(parseFloat(window.getComputedStyle(ta, null).height)) : ta.offsetHeight;
                }
            }

            if (cachedHeight !== actualHeight) {
                cachedHeight = actualHeight;
                var evt = createEvent('autosize:resized');
                try {
                    ta.dispatchEvent(evt);
                } catch (err) {
                    // Firefox will throw an error on dispatchEvent for a detached element
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=889376
                }
            }
        }

        var pageResize = function pageResize() {
            if (ta.clientWidth !== clientWidth) {
                update();
            }
        };

        var destroy = function (style) {
            window.removeEventListener('resize', pageResize, false);
            ta.removeEventListener('input', update, false);
            ta.removeEventListener('keyup', update, false);
            ta.removeEventListener('autosize:destroy', destroy, false);
            ta.removeEventListener('autosize:update', update, false);

            Object.keys(style).forEach(function (key) {
                ta.style[key] = style[key];
            });

            map.delete(ta);
        }.bind(ta, {
            height: ta.style.height,
            resize: ta.style.resize,
            overflowY: ta.style.overflowY,
            overflowX: ta.style.overflowX,
            wordWrap: ta.style.wordWrap
        });

        ta.addEventListener('autosize:destroy', destroy, false);

        // IE9 does not fire onpropertychange or oninput for deletions,
        // so binding to onkeyup to catch most of those events.
        // There is no way that I know of to detect something like 'cut' in IE9.
        if ('onpropertychange' in ta && 'oninput' in ta) {
            ta.addEventListener('keyup', update, false);
        }

        window.addEventListener('resize', pageResize, false);
        ta.addEventListener('input', update, false);
        ta.addEventListener('autosize:update', update, false);
        ta.style.overflowX = 'hidden';
        ta.style.wordWrap = 'break-word';

        map.set(ta, {
            destroy: destroy,
            update: update
        });

        init();
    }

    function destroy(ta) {
        var methods = map.get(ta);
        if (methods) {
            methods.destroy();
        }
    }

    function update(ta) {
        var methods = map.get(ta);
        if (methods) {
            methods.update();
        }
    }

    var autosize = null;

    // Do nothing in Node.js environment and IE8 (or lower)
    if (typeof window === 'undefined' || typeof window.getComputedStyle !== 'function') {
        autosize = function autosize(el) {
            return el;
        };
        autosize.destroy = function (el) {
            return el;
        };
        autosize.update = function (el) {
            return el;
        };
    } else {
        autosize = function autosize(el, options) {
            if (el) {
                Array.prototype.forEach.call(el.length ? el : [el], function (x) {
                    return assign(x, options);
                });
            }
            return el;
        };
        autosize.destroy = function (el) {
            if (el) {
                Array.prototype.forEach.call(el.length ? el : [el], destroy);
            }
            return el;
        };
        autosize.update = function (el) {
            if (el) {
                Array.prototype.forEach.call(el.length ? el : [el], update);
            }
            return el;
        };
    }

    exports.default = autosize;
    module.exports = exports['default'];
});

//#endregion