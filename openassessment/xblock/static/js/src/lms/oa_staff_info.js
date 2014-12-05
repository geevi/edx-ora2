/**
 Interface for staff info view.

 Args:
 element (DOM element): The DOM element representing the XBlock.
 server (OpenAssessment.Server): The interface to the XBlock server.
 baseView (OpenAssessment.BaseView): Container view.

 Returns:
 OpenAssessment.StaffInfoView
 **/
OpenAssessment.StaffInfoView = function(element, server, baseView) {
    this.element = element;
    this.server = server;
    this.baseView = baseView;
//    this.pointsField = new OpenAssessment.IntField(
//        $("#openassessment__staff-info__regrade_points", this.element),
//        { min: 0, max: 999 }
//    );
};


OpenAssessment.StaffInfoView.prototype = {

    /**
     Load the Student Info section in Staff Info.
     **/
    load: function() {
        var view = this;

        // If we're course staff, the base template should contain a section
        // for us to render the staff info to.  If that doesn't exist,
        // then we're not staff, so we don't need to send the AJAX request.
        if ($('#openassessment__staff-info', view.element).length > 0) {
            this.server.render('staff_info').done(
                function(html) {
                    // Load the HTML and install event handlers
                    $('#openassessment__staff-info', view.element).replaceWith(html);
                    view.installHandlers();
                }
            ).fail(function(errMsg) {
                    view.baseView.showLoadError('staff_info');
                });
        }
    },

    /**
     Upon request, loads the student info section of the staff info view. This
     allows viewing all the submissions and assessments associated to the given
     student's current workflow.
     **/
    loadStudentInfo: function() {
        var view = this;

        var sel = $('#openassessment__staff-info', this.element);
        var student_id = sel.find('#openassessment__student_id').val();
        this.server.studentInfo(student_id).done(
            function (html) {
                // Load the HTML and install event handlers
                $('#openassessment__student-info', view.element).replaceWith(html);

                // Install key handler for new staff grade Save button.
                var selStudentInfo = $('#openassessment__staff-info__regrade', this.element);
                selStudentInfo.on('click', '#submit_new_staff_grade', function (eventObject) {
                        eventObject.preventDefault();
                        view.overrideStaffGrade($(this).data('assessment-id'));
                    }
                );
                // Install key handler for new staff grade field.
                selStudentInfo.on('submit', '#openassessment_staff_regrade_form', function (eventObject) {
                        eventObject.preventDefault();
                        view.overrideStaffGrade($(this).data('assessment-id'));
                    }
                );
            }
        ).fail(function(errMsg) {
                view.showLoadError('student_info');
            });
    },

    /**
     Upon request, overrides the current assessment grade.
     **/
    overrideStaffGrade: function(assessmentId) {
        var view = this;
        var sel = $('#openassessment__staff-info', this.element);
        var points = sel.find('#openassessment__staff-info__regrade_points').val();
        var comments = sel.find('#openassessment__staff-info__regrade_comments').val();

        this.server.assessmentOverride(assessmentId, points, comments).done(
            function(html) {
                // Load the HTML and install event handlers
                $('.override-grade-error').html('');
                $('#openassessment__staff-info__regrade-info', view.element).html(html);

            }
        ).fail(function(errMsg) {
                $('.override-grade-error').html(errMsg);
            });
    },

    /**
     Install event handlers for the view.
     **/
    installHandlers: function() {
        var sel = $('#openassessment__staff-info', this.element);
        var selStudentInfo = $('#openassessment__student-info', this.element);
        var view = this;

        if (sel.length <= 0) {
            return;
        }

        if (selStudentInfo.length <= 0) {
            return;
        }

        this.baseView.setUpCollapseExpand(sel, function() {});

        // For Staff regrade section.
        this.baseView.setUpCollapseExpand(selStudentInfo, function() {});

        // Install key handler for student id field
        sel.find('#openassessment_student_info_form').submit(
            function(eventObject) {
                eventObject.preventDefault();
                view.loadStudentInfo();
            }
        );

        // Install a click handler for requesting student info
        sel.find('#submit_student_id').click(
            function(eventObject) {
                eventObject.preventDefault();
                view.loadStudentInfo();

            }
        );


        // Install a click handler for scheduling AI classifier training
        sel.find('#schedule_training').click(
            function(eventObject) {
                eventObject.preventDefault();
                view.scheduleTraining();
            }
        );

        // Install a click handler for rescheduling unfinished AI tasks for this problem
        sel.find('#reschedule_unfinished_tasks').click(
            function(eventObject) {
                eventObject.preventDefault();
                view.rescheduleUnfinishedTasks();
            }
        );
    },

    /**
     Sends a request to the server to schedule the training of classifiers for
     this problem's Example Based Assessments.

     **/
    scheduleTraining: function() {
        var view = this;
        this.server.scheduleTraining().done(
                function(msg) {
                    $('#schedule_training_message', this.element).text(msg)
                }
            ).fail(function(errMsg) {
                $('#schedule_training_message', this.element).text(errMsg)
            });
    },

    /**
     Begins the process of rescheduling all unfinished grading tasks. This incdludes
     checking if the classifiers have been created, and grading any unfinished
     student submissions.

     **/
    rescheduleUnfinishedTasks: function() {
        var view = this;
        this.server.rescheduleUnfinishedTasks().done(
                function(msg) {
                    $('#reschedule_unfinished_tasks_message', this.element).text(msg)
                }
            ).fail(function(errMsg) {
                $('#reschedule_unfinished_tasks_message', this.element).text(errMsg)
            });
    }
};
