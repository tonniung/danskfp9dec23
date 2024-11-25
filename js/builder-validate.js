(function (Validate, $, undefined) {

    var running = false;
    var errors = {};
    var errorCount = 0;

    // Init
    $(function() {
    });

    Validate.Run = async function() {
        if(running) {
            return;
        }

        Validate.Overlay.Show();
        running = true;
        
        Validate.Overlay.UpdateText('Validere "date-item"');
        await Wait(10);
        await CheckDataItem();

        Validate.Overlay.UpdateText('Validere "Checkbox"');
        await Wait(10);
        await CheckCheckboxes();
        
        Validate.Overlay.UpdateText('Validere "Underline Word"');
        await Wait(10);
        await CheckUnderlinedWord();
        
        Validate.Overlay.UpdateText('Validere "Textarea"');
        await Wait(10);
        await CheckTextarea();
        
        Validate.Overlay.UpdateText('Validere "Input text"');
        await Wait(10);
        await CheckInputText();
        
        Validate.Overlay.UpdateText('Validere "Label"');
        await Wait(10);
        await CheckLabel();

        Validate.Overlay.UpdateText('Validere "word-list"');
        await Wait(10);
        await CheckWordlist();

        // Ved ikke endnu hvordan vi skal teste input-find-replace

        Validate.Overlay.UpdateText('Validere "MathQuill"');
        await Wait(10);
        await CheckMathQuill();

        Validate.Overlay.Hide();
        Validate.Overlay.UpdateText('Clearing localstorage');
        localStorage.clear();
        Builder.CallSave();
        await Wait(10);
        
        ShowReport();
        running = false;
    };

    function CheckDataItem() {
        return new Promise(async function(resolve) {
            var dataItems = $('.wrapper [data-item]');
            var dataItemsAmount = dataItems.length;

            for(let i=0; i<dataItemsAmount; i++) {
                var tempId = $(dataItems[i]).attr("id");
                if($('.wrapper [data-item][id="'+tempId+'"]').length > 1) {
                    AddError("data-item", {
                        "Felt": tempId,
                        "Besked": "Id eksistere mere end 1 gang",
                    });
                }
            }
            resolve();
        });
    }

    function CheckCheckboxes() {
        return new Promise(async function(resolve, reject) {
            var wrapperCheckboxes = $('.wrapper input[type="checkbox"][data-item]');
            var wrapperCheckboxesAmount = wrapperCheckboxes.length;
            if(wrapperCheckboxesAmount != $('#builder input[type="checkbox"][data-item]').length) {
                for(let i=0; i<wrapperCheckboxesAmount; i++) {
                    let tempId = $(wrapperCheckboxes[i]).attr("id");
                    if($('#builder input[type="checkbox"][data-item][id="'+tempId+'"]').length == 0) {
                        AddError("checkbox", {
                            "Felt": tempId,
                            "Besked": "Mangler i print version.",
                        });
                    }
                }
            }
            for(var i=0; i<wrapperCheckboxesAmount; i++) {
                Validate.Overlay.UpdateText('Validere "Checkbox" ' + (i + 1) + "/" + wrapperCheckboxesAmount);

                if($('#builder input[type="checkbox"][data-item][id="'+$(wrapperCheckboxes[i]).attr("id")+'"]').length > 1) {
                    AddError("checkbox", {
                        "Felt": $(wrapperCheckboxes[i]).attr("id"),
                        "Besked": "Et eller flere felter har samme id"
                    });
                }
                else {
                    $(wrapperCheckboxes[i]).trigger("click");
                    Builder.CallSave();
                    await Wait(1);
                    var builderCheckboxes = $('#builder input[type="checkbox"][data-item]');
                    var builderCheckboxesAmount = wrapperCheckboxes.length;
                    for(var k=0; k<builderCheckboxesAmount; k++) {
                        if($(builderCheckboxes[k]).attr("id") == $(wrapperCheckboxes[i]).attr("id")) {
                            if($(builderCheckboxes[k]).siblings(".hidden").text() != "x") {
                                AddError("checkbox", {
                                    "Felt": $(wrapperCheckboxes[i]).attr("id"),
                                    "Besked": "Resultaterne er ikke ens"
                                });
                                break;
                            }
                        }
                    }

                    // Remove the click again
                    $(wrapperCheckboxes[i]).trigger("click");
                    Builder.CallSave();
                }
                
                await Wait(1);
            }
            resolve();

        });
    }

    function CheckUnderlinedWord() {
        return new Promise(async function(resolve) {
            var underlinedWords = $('.wrapper .underline-words');
            var underlinedWordsAmount = underlinedWords.length;
            if(underlinedWordsAmount != $('#builder .underline-words').length) {
                for(let i=0; i<underlinedWordsAmount; i++) {
                    let tempId = $(underlinedWords[i]).attr("id");
                    if($('#builder .underline-word [id^="'+tempId+'_"]').length == 0) {
                        AddError("underlined-words", {
                            "Felt": tempId,
                            "Besked": "Mangler i print version.",
                        });
                    }
                }
            }
            resolve();
        });
    }

    function CheckTextarea() {
        return new Promise(async function(resolve) {
            var textareas = $('.wrapper textarea[data-item]');
            var textareasAmount = textareas.length;
            if(textareasAmount != $('#builder textarea').length) {
                for(let i=0; i<textareasAmount; i++) {
                    let tempId = $(textareas[i]).attr("id");
                    if($('#builder textarea[id="'+tempId+'"]').length == 0) {
                        AddError("textarea", {
                            "Felt": tempId,
                            "Besked": "Mangler i print version."
                        });
                    }
                }
            }

            // Hvis textareaet er der, så burde det også virke
            // for(let i=0; i<textareasAmount; i++) {
            //     let tempId = $(textareas[i]).attr("id");
            //     let tempBuildTextarea = $('#builder textarea[id="'+tempId+'"]');
            //     if($('#builder textarea[id="'+tempId+'"]').length == 1) {
            //         $(textareas[i]).val("test").trigger("keyup");
            //         Builder.CallSave();

            //         if(tempBuildTextarea.val() != "test") {
            //             AddError("textarea", {
            //                 "Felt": tempId,
            //                 "Besked": "Mangler i print version."
            //             });
            //         }

                    
            //         $(textareas[i]).val("").trigger("keyup");
            //         Builder.CallSave();
            //     }
            // }

            resolve();
        });
    }

    function CheckInputText() {
        return new Promise(async function(resolve) {
            var inputs = $('.wrapper input[type="text"][data-item]:not([data-header-item])');
            var inputsAmount = inputs.length;
            if(inputsAmount != $('#builder input[type="text"]').length) {
                for(let i=0; i<inputsAmount; i++) {
                    let tempId = $(inputs[i]).attr("id");
                    if($('#builder input[type="text"][id="'+tempId+'"]').length == 0) {
                        AddError("input[type=text]", {
                            "Felt": tempId,
                            "Besked": "Mangler i print version."
                        });
                    }
                }
            }

            // Hvis input text er der, så burde det også virke

            resolve();
        });
    }

    function CheckLabel() {
        return new Promise(async function(resolve) {
            var labels = $('.wrapper label[for]:not(.hide)');
            var labelsAmount = labels.length;
            for(let i=0; i<labelsAmount; i++) {
                let tempId = $(labels[i]).attr("for");
                if($('.wrapper label[for="'+tempId+'"]:not(.hide)').length > 1) {
                    AddError("label", {
                        "Felt": tempId,
                        "Besked": "Flere labels referere til samme id",
                    });
                }
            }
            resolve();
        });
    }

    function CheckWordlist() {
        return new Promise(async function(resolve) {
            // Det kan være til både input felter (engelsk - section 1) og textarea's (engelsk - section 4)
            var wordLists = $('.wrapper .word-list');
            var wordListsAmount = wordLists.length;

            for(let i=0; i<wordListsAmount; i++) {
                let tempHandle = $(wordLists[i]).attr("data-handle");
                if($('.wrapper .word-list[data-handle="' + tempHandle + '"]').length > 1) {
                    AddError("wordlist", {
                        "Felt": tempHandle,
                        "Besked": "Flere wordlists har samme handle.",
                    });
                }
                if($('.wrapper [data-wordlist="' + tempHandle + '"]').length == 0) {
                    AddError("wordlist", {
                        "Felt": tempHandle,
                        "Besked": "Der er ingen der referere til denne wordlist.",
                    });
                }
            }

            var wordListItems = $('.wrapper [data-wordlist]');
            var wordListItemsAmount = wordListItems.length;
            for(let i=0; i<wordListItemsAmount; i++) {
                let tempHandle = $(wordListItems[i]).attr("data-wordlist");
                if($('.wrapper .word-list[data-handle="' + tempHandle + '"]').length == 0) {
                    AddError("wordlist", {
                        "Felt": tempHandle,
                        "Besked": "Der findes ikke en wordlist med det handle.",
                    });
                }
            }



            resolve();
        });
    }

    function CheckMathQuill() {
        return new Promise(async function(resolve) {
            var mathQuills = $('.wrapper .equation');
            var mathQuillsAmount = mathQuills.length;
            if(mathQuillsAmount != $('#builder .equation').length) {
                for(let i=0; i<mathQuillsAmount; i++) {
                    let tempId = $(mathQuills[i]).attr("id");
                    if($('#builder .equation[id="'+tempId+'"]').length == 0) {
                        AddError("MathQuill", {
                            "Felt": tempId,
                            "Besked": "Mangler i print version."
                        });
                    }
                }
            }
            resolve();
        });
    }

    function AddError(type, args) {
        if(!errors.hasOwnProperty(type)) {
            errors[type] = [];
        }
        errors[type].push(args);
        errorCount++;
    }

    function ShowReport() {
        console.group("%cValidation Report", "font-size:20px;");
        if(errorCount == 0) {
            console.log("%c✅ No errors", "color:#009900;font-size:15px;");
        }
        else {
            console.log("%c❗ " + errorCount + " errors found", "color:#aa0000;font-size:15px;");
            $.each(errors, function(key, value) {
                console.group(key);
                console.table(value);
                console.groupEnd();
            });
        }
        console.groupEnd();
    }

    function WaitFor(conditionFunction) {
        const poll = resolve => {
            if(conditionFunction()) {
                resolve();
            }
            else {
                setTimeout(_ => poll(resolve), 500);
            }
        };
        return new Promise(poll);
    }

    function Wait(ms) {
      return new Promise(r => setTimeout(r, ms));
    }

    function Overlay() {

        var overlay = null;
        var overlayText = null;

        // Init
        $(function() {
            Create();
        });

        function Create() {
            overlay = $('<div style="position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,0.6);color: #FFFFFF;justify-content: center;align-items: center;z-index:10;"></div>').appendTo($("body")).hide();
            overlayText = $('<div style="padding: 50px;text-align: center;background: rgba(0,0,0,0.8);width: 100%;"></div>').appendTo(overlay);
        }

        this.UpdateText = function(value) {
            overlayText.html(value);
        }

        this.Show = function() {
            Validate.Overlay.UpdateText("");
            overlay.css("display", "flex");
        };

        this.Hide = function() {
            overlay.hide();
            Validate.Overlay.UpdateText("");
        };


    }
    Validate.Overlay = new Overlay();

}(window.Validate = window.Validate || {}, jQuery));