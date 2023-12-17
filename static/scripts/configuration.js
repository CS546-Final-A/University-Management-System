function navigateTo(url) {
    window.location.href = url;
}

// Add click event listeners to menu cards
document.getElementById('departments').addEventListener('click', function () {
    navigateTo('/configuration/departments'); 
});

document.getElementById('locations').addEventListener('click', function () {
    navigateTo('/configuration/locations');
});