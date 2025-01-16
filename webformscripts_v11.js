// Page Load Functions
function loadForm(){
    
    //Enable the submit button (if Javascript is enabled)
    document.getElementById('submitbutton').className = "button";
    document.getElementById('submitbutton').disabled  = false;
    
    // This needs to be a JSON-formatted string, containing all marketing tag names + values. Format: "{'tag1':'value1','tag2':'value2'}"
    if (navigator.cookieEnabled === true){
        
        if (document.cookie!=''){
        
            // Store all cookies to field
            document.getElementById("cookies").value = document.cookie;

            // Map Cookie Data
            let cookieData = Object.fromEntries(document.cookie.split('; ').map(x => x.split('=')));

            // Remove Undefined Elements
            if (!cookieData['utm_source']){cookieData['utm_source']=''};
            if (!cookieData['utm_medium']){cookieData['utm_medium']=''};
            if (!cookieData['utm_campaign']){cookieData['utm_campaign']=''};
            if (!cookieData['utm_term']){cookieData['utm_term']=''};
            if (!cookieData['utm_content']){cookieData['utm_content']=''};
            if (!cookieData['_gcl_aw']){cookieData['_gcl_aw']=''};
            
            // Code block to add specific marketing tags to hidden fields
            document.getElementById("utmSource").value   = cookieData['utm_source'];
            document.getElementById("utmMedium").value   = cookieData['utm_medium'];
            document.getElementById("utmCampaign").value = cookieData['utm_campaign'];
            document.getElementById("utmTerm").value     = cookieData['utm_term'];
            document.getElementById("utmContent").value  = cookieData['utm_content'];
            
            // Extract GCLID Parameter from longer Google String
            if (cookieData['_gcl_aw'].indexOf(".") >= 0){
                document.getElementById("GCLID").value = cookieData['_gcl_aw'].split(".").at(-1);
            };
            
        };
    } else {
        document.getElementById("custentity_gprs_mktg").value = "client cookies disabled";
    };
};

// Load File Data
var FileData=[];
function loadFile(files){

    // Set Output Array
    var FileReadQty = 0;
    var TotFiles = files.length;
    
    // Grey out Submit Button until file load is complete
    document.getElementById('submitbutton').className = "button_disabled";
    document.getElementById('submitbutton').disabled  = true;

    // Construct Required Functions
    const changeStatus = (status) => {
        document.getElementById('status').innerHTML = status;
    }

    // Update Status
    changeStatus('Loading Files ...');

    // Progress Bar (Not Utilized)
    const setProgress = (e) => {
        const fr = e.target;
        const loadingPercentage = 100 * e.loaded / e.total;
        document.getElementById('progress-bar').value = loadingPercentage;
    }

    // Load Files
    const loaded = (e) => {
        const fr = e.target;
        changeStatus('Files Loaded!');
        FileData.push({'FileName':fr.filename, 'Content':fr.result});
        FileReadQty += 1;
        
        if(TotFiles == FileReadQty){    
            // Allow Submit Button
            document.getElementById('submitbutton').className = "button";
            document.getElementById('submitbutton').disabled  = false;
        }
    }

    // Error Handling
    const errorHandler = (e) => {
        changeStatus('Error: ' + e.target.error.name);
    }

    // Loop through each file
    for (var i=0; i<=files.length-1; i++){
        const fr = new FileReader();
        fr.filename = files[i].name;
        fr.readAsDataURL(files[i]);
        fr.addEventListener('loadend', loaded);
        fr.addEventListener('error', errorHandler);
    }
};


// Hide-Show Script for all radio button enabled fields. Will clear data from hidden fields.
function yesnoCheck(){

    // Multi-state Radio Button
    if (document.getElementById('multistate_yes').checked) {
        document.getElementById('multistate_input').style.display = 'block';
    } else {
        document.getElementById('multistate_input').style.display = 'none';
        document.getElementById('multistate_list').value = '';
    }

    // Site Contact Information Boxes
    if (document.getElementById('sitecontact_other').checked) {
        document.getElementById('sitecontact_info').style.display = 'block';
        document.getElementById('sitecontact_firstname').required = true;
        document.getElementById('sitecontact_lastname').required = true;
        document.getElementById('sitecontact_email').required = true;
        document.getElementById('sitecontact_phone').required = true;
    } else {
        document.getElementById('sitecontact_info').style.display = 'none';
        document.getElementById('sitecontact_firstname').value = '';
        document.getElementById('sitecontact_lastname').value = '';
        document.getElementById('sitecontact_email').value = '';
        document.getElementById('sitecontact_phone').value = '';
        document.getElementById('sitecontact_firstname').required = false;
        document.getElementById('sitecontact_lastname').required = false;
        document.getElementById('sitecontact_email').required = false;
        document.getElementById('sitecontact_phone').required = false;
    }  
};

// Form Hashing
function strHash(inputStr) {
    var hash = 0,
      i, chr;
    if (inputStr.length === 0) return hash;
    for (i = 0; i < inputStr.length; i++) {
      chr = inputStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  };


// Google Places API > Autocomplete job site address
let autocomplete;
let address1Field;


function initAutocomplete() {
    
    // Obtain the address information from the web form
    address1Field = document.querySelector("#siteAddress");
    
    // Create the autocomplete object, restricting the search predictions to addresses in the US.
    autocomplete = new google.maps.places.Autocomplete(address1Field, {
        componentRestrictions: { country: ["us"] },
        fields: ["address_components", "geometry"],
        types: ["address"],
    });
    
    // When the user selects an address from the drop-down, populate the address fields in the form.
    autocomplete.addListener("place_changed", fillInAddress);
  };


function fillInAddress() {
    
    // Get the place details from the autocomplete object.
    const place = autocomplete.getPlace();
    let address1 = "";

    // Loop through the address record
    for (const component of place.address_components) {
      
      // @ts-ignore remove once typings fixed
      const componentType = component.types[0];

      // Build out the address components
      switch (componentType) {
        case "street_number": {
          address1 = `${component.long_name} ${address1}`;
          break;
        }
        case "route": {
          address1 += component.short_name;
          break;
        }
        case "locality":
          document.querySelector("#siteCity").value = component.long_name;
          break;
        case "administrative_area_level_1": {
          document.querySelector("#siteState").value = component.short_name;
          break;
        }
      
      }
    }

    // Set the original address to just the street value
    document.querySelector("#siteAddress").value = address1

  };

// Initialize Variable array (for formatting concatenated text box)
let fieldArr = [
      {'id':'residentialCB','type':'checkbox','prefix':'<tr><b><u>','suffix':'</u></b></tr>'},
      {'id':'contactDiv','type':'label','prefix':'<tr><td colspan=3><b><u>CONTACT DETAILS</u></b></td></tr>','suffix':''},
      {'id':'firstname','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'lastname','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'companyname','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'phonenumber','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'email','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'projectRole','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'quoteDate','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'serviceDate','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'industry','type':'select','prefix':'<tr>','suffix':'</tr>'},
      {'id':'locationDiv','type':'label','prefix':'<tr><td colspan=3>&nbsp;</td></tr><tr><td colspan=2><b><u>PROJECT LOCATION</u></b></td></tr>','suffix':''},
      {'id':'siteAddress','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'siteCity','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'siteState','type':'select','prefix':'<tr>','suffix':'</tr>'},
      {'id':'multistate_yes','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'multistate_no','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'multistate_list','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'sitecontact_myself','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'sitecontact_other','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'sitecontact_none','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'sitecontact_firstname','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'sitecontact_lastname','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'sitecontact_phone','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'sitecontact_email','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'projectDiv','type':'label','prefix':'<tr><td colspan=3>&nbsp;</td></tr><tr><td colspan=2><b><u>PROJECT INFORMATION</u></b></td></tr>','suffix':''},
      {'id':'serviceType','type':'select','prefix':'<tr>','suffix':'</tr>'},
      {'id':'projectNumber','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'choiceInterior','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'choiceExterior','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'choiceBoth','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'utilityDiv','type':'label','prefix':'<tr><td colspan=3>&nbsp;</td></tr><tr><td colspan=2><b>Utility Services:</b></td></tr>','suffix':''},
      {'id':'utilityCBTrench','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'utilityCBSoilBoring','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'utilityCBBore','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'utilityCBUST','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'utilityCBVoid','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'utilityCBPre','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'concreteDiv','type':'label','prefix':'<tr><td colspan=3>&nbsp;</td></tr><tr><td colspan=2><b>Concrete Services:</b></td></tr>','suffix':''},
      {'id':'concreteServices','type':'select','prefix':'<tr>','suffix':'</tr>'},
      {'id':'concreteSlabType','type':'select','prefix':'<tr>','suffix':'</tr>'},
      {'id':'elevatedWorkNo','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'elevatedWorkYes','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'vpiDiv','type':'label','prefix':'<tr><td colspan=3>&nbsp;</td></tr><tr><td colspan=2><b>VPI Services:</b></td></tr>','suffix':''},
      {'id':'vpiServiceType','type':'select','prefix':'<tr>','suffix':'</tr>'},
      {'id':'vpiLinearFeet','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'vpiDiameter','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'vpiLateral','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'leakDiv','type':'label','prefix':'<tr><td colspan=3>&nbsp;</td></tr><tr><td colspan=2><b>Leak Services:</b></td></tr>','suffix':''},
      {'id':'leakIndicator','type':'select','prefix':'<tr>','suffix':'</tr>'},
      {'id':'leakLocation','type':'select','prefix':'<tr>','suffix':'</tr>'},
      {'id':'imagingDiv','type':'label','prefix':'<tr><td colspan=3>&nbsp;</td></tr><tr><td colspan=2><b>Laser Scanning Services:</b></td></tr>','suffix':''},
      {'id':'choiceLSYes','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'choiceLSNo','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'choiceHigh','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'choiceMedium','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'choiceLow','type':'radio','prefix':'<tr>','suffix':'</tr>'},
      {'id':'ls_scaninfo','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'ls_squarefootage','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'ls_scandetail','type':'text','prefix':'<tr>','suffix':'</tr>'},
      {'id':'none','type':'free-text','prefix':'<tr><td colspan=3>&nbsp;</td></tr><tr><td colspan=2>Deliverables:</td></tr>','suffix':''},
      {'id':'laserCB_IMC','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'laserCB_CPC','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'laserCB_TVF','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'laserCB_VMCC','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'laserCB_2DD','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'laserCB_2DC','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'laserCB_3DM','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'laserCB_3DSM','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'laserCB_3DIM','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'laserCB_Other','type':'checkbox','prefix':'<tr>','suffix':'</tr>'},
      {'id':'sitemapDiv','type':'label','prefix':'<tr><td colspan=3>&nbsp;</td></tr><tr><td colspan=2><b>SiteMap Services:</b></td></tr>','suffix':''},
      {'id':'sitemapRequest','type':'select','prefix':'<tr>','suffix':'</tr>'},
      {'id':'projectNotes','type':'text','prefix':'<tr>','suffix':'</tr>'}
];


// Search through parent nodes for any hidden DIVs
function findUpTag(el, breaktag) {
    
  while (el.parentNode) {
      
      // Move up one level
      el = el.parentNode;

      if (el.style.display === 'none'){
          return true;
      }
      if (el.id === breaktag){
        return false;
      }
  }

  return false;
}



    