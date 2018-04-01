function courseInfo(){
    /*
        The following will be hard coded as placeholders until actual implementation and results are available
    */
    //login
    //window.open("https://loris.wlu.ca","_blank");
    
var link1 = "https://loris.wlu.ca/ssb_prod/bwckctlg.p_disp_course_detail?cat_term_in=";
    var link2 = "&subj_code_in=";
    var link3 = "&crse_numb_in=";
    
    var term = 201805;
    var subj = "CP";
    var course = "104";
    var main = window.open(link1 + term + link2 + subj + link3 + course,"_blank");
    
    
    //======================================================================
    var title;
    var content;
    
    title = document.getElementsByClassName('nttitle');
    content = document.getElementsByClassName('ntdefault');
    
    //======================================================================
    
    var courseWindow = window.open("", "courseWindow", "width=1080,height=720");
    courseWindow.document.write('<p>'+title[0].innerHTML+'</p>');
    courseWindow.document.write('<p>'+content[0].innerHTML+'</p>');
}

courseInfo();