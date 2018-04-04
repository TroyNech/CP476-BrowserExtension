function main() {
    /*
    make a scrip so that this piece of code is executed only on the VSB
    window.open('https://scheduleme.wlu.ca/vsb/s/slzpame','_self');
    A LOGIN PORTAL IS IMPOSSIBLE. YOU MUST PUBPLISH YOUR CHROME APP AND USE A ChromeOS DEVICE TO USE    
    */
    
    //=================GET CRN FROM VSB
    
    //var crn = ['1','2','3','4','5','6','7','8','9','10'];
    var crn = document.getElementById("cartCrns").value;
    crn = str.replace(/[()]/g,"");
    crn = crn.split(" ");
    
    //=================NAVIGATE THROUGH LORIS
    
    window.open('https://loris.wlu.ca/ssb_prod/bwskfreg.P_AltPin','_self');
    //setTimeout(submitTerm,1500);
    document.forms[1].submit();
    //setTimeout(inputCRN,1500);
    
    var i=0;
    while(i < crn.length-1){
        document.getElementById('crn_id' + (i + 1)).value = crn[i];
        i=i+1;
    }
}

function submitTerm(){
    document.forms[1].submit();
}

function wait(ms){
    var d = new Date();
    var d2 = null;
    do { d2 = new Date(); }
    while(d2-d < ms);
    return;
}

main();