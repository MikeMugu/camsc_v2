$(document).ready(function() {
    var page = window.location.pathname.split('/')[1];
    // default to home page
    page = page === '' ? 'home' : page;
    
    $('#menubar ul').find('[name=' + page + ']').addClass('selected');
});
