function main() {
    //make a scrip so that this piece of code is executed only on the VSB
    //var crn = document.getElementById("cartCrns").value;
    
    
    //window.open('https://scheduleme.wlu.ca/vsb/s/slzpame','_self');
    
    
    var crn = document.getElementById("cartCrns").value;
    crn = str.replace(/[()]/g,"");
    crn = crn.split(" ");
    wait(2000);
    //var crn = ['1','2','3','4','5','6','7','8','9','10'];
    
    //redirect to loris
    //see if they already logged in or not
    
    //assume they are on the front page now
    //https://loris.wlu.ca/ssb_prod/twbkwbis.P_GenMenu?name=bmenu.P_MainMnu
    
    //redirect to 'select a term'
    //https://loris.wlu.ca/ssb_prod/bwskfreg.P_AltPin
    window.open('https://loris.wlu.ca/ssb_prod/bwskfreg.P_AltPin','_self');
    //setTimeout(submitTerm,1500);
    //setTimeout(inputCRN,1500);
    wait(2000);
    document.forms[1].submit();
    wait(2000);
    
    var i=0
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