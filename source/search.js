function searchGoogle(){
    const query = document.getElementById("searchInput").value;
    if(query){
        window.location.href = "https://www.google.com/search?q=" + encodeURIComponent(query);
    }
}