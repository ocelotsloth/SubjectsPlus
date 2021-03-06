function LinkList(id,idSelector) {

    $('#save_guide').hide();

    hideLinkListTextareas();

    activateCKEditors();


    var myId = id;

    //console.log(myId);

    var recordSearch = new RecordSearch;
    var myRecordList = new RecordList;

    // Autocomplete search
    $(' .databases-search').keyup(function (data) {
        if ($('.databases-search').val().length > 2) {
            databaseSearch();
        }


    });
    // Rerun the search when the user changes the limit az box
    $('#limit-az').on('change', function () {
        databaseSearch();
    });

    // Add to sortable list when user click the add button
    $('body').on('click', '.add-to-list-button', function () {
        // Create a Record object for the listing you clicked on
        var li = $(this).closest('li.database-listing').data();
        var myRecord = new Record({
            recordId: li.recordId,
            title: li.title,
            prefix: li.prefix,
            location: li.location,
            showIcons : li.showIcons,
            showDescription : li.showDescription,
            showNote : li.showNote
        });

        // Add that record to the main RecordList
        myRecordList.addToList(myRecord);
        // Get a sortable list and append it to the draggable link list area
        var sortableList = new RecordListSortable(myRecordList);
        $('.link-list-draggable').html(sortableList.getList());
        $('.db-list-results').sortable();

    });

    // Reset the the html and RecordList instance
    $(' .dblist-reset-button').on('click', function () {
        $(this).parents().find('.link-list-draggable').html('');
        myRecordList = new RecordList;
    });

    // Create List button
    $(' .dblist-button').on('click', function () {
        var list = $(this).parents().find('.link-list');
        loadSortableList();
        if (myRecordList.getList().length > 0) {


            saveDescriptionOverride(myRecordList);

            var displayList = new RecordListDisplay(myRecordList);
            var descriptionLocation = $('input[name=linkList-text-radio]:checked').val();

            list.html(displayList.getList());

            var description = CKEDITOR.instances['link-list-textarea'].getData();
            //var description = '';

            if (descriptionLocation == "top") {
                list.prepend("<div class='link-list-text-top'>" + description + "</div>");
            } else {
                list.append("<div class='link-list-text-bottom'>" + description + "</div>");
            }

            //remove the textarea with the list in the admin view after saving changes
            $('[name="link-list-textarea"]').hide();

            saveSetup().saveGuide();

        } else {
            alert('Please add some records to your list.')
        }
    });

    // Allows override button to show/hide the description override text area
    $('body').on('click', '.db-list-item-description-override', function (event) {
        $(this).parent().find('textarea').toggle();
        event.preventDefault();
        event.stopPropagation();
    });
    
    //show textareas
    $('body').on('click', '#show-linklist-textarea-btn', function() {

        $('#link-list-textarea-container').show();

    });

    $('body').on('click', '#show-record-description-btn', function(event) {
        event.preventDefault();
        $('#record-description-container').show();
    });

    function saveDescriptionOverride(myRecordList) {
        var recordList = myRecordList.recordList;
        var subject_id = $('#guide-parent-wrap').attr("data-subject-id");

        $.each(recordList, function (index, obj) {
            var titleId = obj.recordId;
            var descriptionOverride = $("li[data-record-id='"+obj.recordId+"']").find("textarea").val();

            $.ajax({
                url: '../records/helpers/subject_databases_helper.php',
                type: "GET",
                dataType: "json",
                async: false,
                data: {
                    'action': 'saveDescriptionOverride',
                    'subject_id': subject_id,
                    'title_id': titleId,
                    'description_override': descriptionOverride
                }
            });
        });

    }

    function databaseSearch() {
        var limitAz;
        if ($('#limit-az').prop("checked")) {
            limitAz = true;
        } else {
            limitAz = false
        }
        recordSearch.search($('.databases-search').val(), limitAz, 'databases-searchresults', addSearchResultsToPage);
    }

    // Load existing list behaviour
    if ($('#LinkList-body').siblings().find('li').parents('ul.link-list-display').find('li')) {
        loadDisplayList($('#LinkList-body').siblings().find('li').parents('ul.link-list-display').find('li'));
    }

    function loadDisplayList(list) {
        // This loads a display list and appends a sortable list
        var existingList = new RecordList();
        list.each(function (li) {

            var existingRecord = new Record({
                title: $(this).data().title,
                prefix: $(this).data().prefix,
                recordId : $(this).data().recordId,
                showIcons : $(this).data().showIcons,
                showDescription : $(this).data().showDescription,
                showNote : $(this).data().showNote,
                location : $(this).data().location
            });

            existingList.addToList(existingRecord);
            var existingSortableList = new RecordListSortable(existingList);
            $('.link-list-draggable').html(existingSortableList.getList());
            $('.db-list-results').sortable();
        });

        myRecordList = existingList;
    }

    function loadSortableList() {
        myRecordList = new RecordList;
        $('.db-list-item-draggable').each(function (li) {
            //console.log(li);
            var record = new Record({
                title: $(this).data().title,
                prefix: $(this).data().prefix,
                recordId : $(this).data().recordId,
                showIcons : $(this).data().showIcons,
                showDescription : $(this).data().showDescription,
                showNote : $(this).data().showNote,
                location : $(this).data().location
            });
            myRecordList.addToList(record);

        });
    }

    function addSearchResultsToPage(data) {
        var searchResults = new RecordList;
        $.each(data, function (index) {
            var resultRecord = recordSearch.searchResultRecord(data[index]);
            //console.log(resultRecord);
            searchResults.addToList(resultRecord);
        });

        var searchResultsDisplay = new RecordListSearch(searchResults);
        var element = document.getElementById('databases-searchresults');
        element.innerHTML = searchResultsDisplay.getList(myId);
    }


    // CKEditor
    function activateCKEditors() {

        // (not loaded yet, your code to load it)
        CKEDITOR.replace('description', {
            toolbar: 'TextFormat'
        });

    }




    function hideLinkListTextareas() {
        $('#link-list-textarea-container').hide();
        $('#record-description-container').hide();
    }



    function toggleCheck(attr,context) {
        //console.log("Checking?");
        //console.log( context.closest('.db-list-item-draggable'));
        //console.log(context.closest('.db-list-item-draggable').attr(attr));

        if (context.closest('.db-list-item-draggable').attr(attr) == "0") {
            //console.log("It's zero!");
            context.closest('.db-list-item-draggable').attr(attr, 1);
            //console.log(context.closest('.db-list-item-draggable').attr(attr));

            //console.log(context.children());
            context.children().removeClass('fa-minus');
            context.children().addClass('fa-check');
        } else {
            //console.log("It's one!");
            context.closest('.db-list-item-draggable').attr(attr, 0);
            //console.log(context.closest('.db-list-item-draggable').attr(attr));

            //console.log(context.children());
            context.children().removeClass('fa-check');
            context.children().addClass('fa-minus');
        }


    }

    $('body').on('click','.show-icons-toggle',function() {
        toggleCheck('data-show-icons',$(this));
    });
    $('body').on('click','.include-note-toggle',function() {
        toggleCheck('data-show-note',$(this));
    });
    $('body').on('click','.show-description-toggle',function() {
        toggleCheck('data-show-description',$(this));
    });


    $('#show_all_icons_input').on('click', function() {
        toggleCheck('data-show-icons',$('.show-icons-toggle'));
    });

    $('#show_all_notes_input').on('click',  function() {
        toggleCheck('data-show-note',$('.include-note-toggle'));
    });

    $('#show_all_desc_input').on('click', function() {
        toggleCheck('data-show-description',$('.show-description-toggle'));
    });


    
    //hide delete button if no items exist
    if($('.db-list-results').length > 0) {
        $('#delete-linklist-btn').show();
    } else {
        $('#delete-linklist-btn').hide();
    }
    

    //delete a saved LinkList
    $('body').on('click', '.modal-delete', function() {

        var elementDeletion = $(this).closest('div[name="modified-pluslet-LinkList"]');

        var thisPlusletId = $(this).closest('div[name="modified-pluslet-LinkList"]').attr('id').split('-')[1];
        //console.log(thisPlusletId);

        var g = guide();
        var subjectId = g.getSubjectId();


        $('<div class=\'delete_confirm\' title=\'Are you sure?\'></div>').dialog({
            autoOpen: true,
            modal: false,
            width: 'auto',
            height: 'auto',
            resizable: false,
            dialogClass: 'topindex',
            buttons: {
                'Yes': function() {
                    // Delete pluslet from database
                    $('#response').load('helpers/guide_data.php', {
                            delete_id: thisPlusletId,
                            subject_id: subjectId,
                            flag: 'delete'
                        },
                        function() {
                            $('textarea[name="link-list-textarea"]').hide();
                            $('#response').fadeIn().delay(4000).fadeOut();;
                            $( '.delete_confirm' ).dialog( 'close' );
                        });

                    // Remove node
                    $(elementDeletion).remove();
                    $( this ).dialog( 'close' );
                    return false;
                },
                Cancel: function() {
                    $( this ).dialog( 'close' );
                }
            }
        });
        return false;

    });


    // Pseudo-cancel action - if sortable list has items close triggers save otherwise it triggers fake delete
    $('body').on('click', '.close-trigger', function() {
        if($('.db-list-results').length > 0) {
            $('.dblist-button').trigger('click');
        } else {

            var newList = $(this).closest('div[name="new-pluslet-LinkList"]');
            var modifiedList = $(this).closest('div[name="modified-pluslet-LinkList"]');

            if(newList.length > 0) {
                //remove the textarea with the list in the admin view after saving changes
                $('[name="link-list-textarea"]').remove();
                newList.remove();
            } else if (modifiedList.length > 0) {
                $('.dblist-button').trigger('click');
            }

        }
    });



    // Triggered by X on sortable list
    $('body').on('click','.db-list-remove-item', function() {
        //console.log('clicked');
        var recordId= $(this).closest('li.db-list-item-draggable').data().recordId;

        for (var i=0;i<myRecordList.recordList.length;i++) {
            var record = myRecordList.recordList[i];
            if (record.recordId === recordId) {
                myRecordList.removeFromList(i);
            }
        }

        $(this).closest('li.db-list-item-draggable').remove();

    });



    // Record submission

    $('#create-record-form').on('submit', function (event) {
        submitRecordForm(event);
    });
    $('#checkurl').on('click', function () {
        checkUrl();
    });


    function submitRecordForm(event) {
        // Override the form submit action. Doing this lets you use the html5 form validation
        // techniques/controls
        if (!document.getElementById('create-record-form').checkValidity()) {
            event.preventDefault();
        } else {
            event.preventDefault();

            // Insert the record object
            createRecord.insertRecord({
                    "title_id": null,
                    "title": $('#record-title').val(),
                    "alternate_title": $('#alternate-title').val(),
                    "description":  CKEDITOR.instances.description.getData(),
                    "pre": null,
                    "last_modified_by": "",
                    "last_modified": "",
                    "subjects": [{ 'subject_id': $('#guide-parent-wrap').data().subjectId }],
                    "locations": [{
                    "location_id": "",
                    "format": "1",
                    "call_number": "",
                    "location": $('#location').val(),
                    "access_restrictions": "1",
                    "eres_display": "N",
                    "display_note": "",
                    "helpguide": "",
                    "citation_guide": "",
                    "ctags": "",
                     "record_status": "Active"
                }]
            }, function(res){
                var record = new Record({
                    recordId: res.record_id,
                    title:  res.record.title,
                    location: res.record.location
                });
                myRecordList.addToList(record);
                var sortableList = new RecordListSortable(myRecordList);
                $('.link-list-draggable').html(sortableList.getList());
                $('.db-list-results').sortable();
            });

            // Reset the form
            document.getElementById('create-record-form').reset();
            // Reset the CKEditor description content
            CKEDITOR.instances.description.setData("");

        }
    }

    function checkUrl() {
        var location = $('#location').val();

        $.post("../../control/records/record_bits.php", {
            type: "check_url",
            checkurl: location
        }, function (data) {
            $('#checkurl').html(data);
        });
    }

    $('body').on('click', '#show-broken-record-form-btn', function() {
        $('#report-broken-record-container').show();
    });

}