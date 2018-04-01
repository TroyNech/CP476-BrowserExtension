function fav(){
/*
https://scheduleme.wlu.ca/vsb/s/slzpame
https://scheduleme.wlu.ca/vsb/s/ejdarjj
https://scheduleme.wlu.ca/vsb/s/koxxhli

[x]open first link
[x]click favourite
[x]open second link
[x]click favourite
...
[X]click favourites sidebar in the end
*/
    var favs = ['https://scheduleme.wlu.ca/vsb/s/slzpame','https://scheduleme.wlu.ca/vsb/s/ejdarjj','https://scheduleme.wlu.ca/vsb/s/koxxhli'];
    var len = favs.length-1;
    
    //window.open(favs[0],'_blank');
    //document.getElementById('addToFavorites').click();
    
    var i = 0;
    var curr;
    while(i < len){
        curr = window.open(favs[i],'aux', 'width=500,height=300');
        curr = document.getElementById('addToFavorites').click();
        curr.close();
        i=i+1;
    }
    
    document.querySelector('.expander.chevron_right').click();
    
}

fav();