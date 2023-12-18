//CSS Colors
var getColor1 = $("html").css("--blackColor");
var getColor2 = $("html").css("--whiteColor");
var glassColor1 = $("html").css("--glassColor1");
var glassColor2 = $("html").css("--glassColor2");
var shadowColor1 = $("html").css("--shadowColor1");
var shadowColor2 = $("html").css("--shadowColor2");
var stripeTableColor1 = $("html").css("--stripeTableColor1");
var stripeTableColor2 = $("html").css("--stripeTableColor2");

//Avoid Flickering on load
if (_isDarkMode) {
  $("html").css("--activeTextColor", getColor2);
  $("html").css("--activeBgColor", getColor1);
  $("html").css("--activeGlassColor", glassColor2);
  $("html").css("--activeShadowColor", shadowColor2);
  $("html").css("--activeStripeTableColor", stripeTableColor2);
}
$(document).ready(function () {
  if (_isDarkMode) {
    $("body").addClass("dark");
    $("#switch").addClass("switched");
    $(".iconSwitch").addClass("invertColor");
  }

  $("#switch").on("click", async function () {
    themeSwitch();

    try {
      const response = await fetch(`/dashboard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          darkmode: _isDarkMode,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data.message);
      } else {
        console.error(`Failed to update theme. Status: ${response.status}`);
      }
    } catch (error) {
      console.error("Error updating theme:", error);
    }
  });
});

//Switch light/dark
function themeSwitch() {
  if ($("body").hasClass("dark")) {
    $("body").removeClass("dark");
    _isDarkMode = 0;
    $("#switch").removeClass("switched");
    $(".iconSwitch").removeClass("invertColor");

    $("html").css("--activeTextColor", getColor1);
    $("html").css("--activeBgColor", getColor2);
    $("html").css("--activeGlassColor", glassColor1);
    $("html").css("--activeShadowColor", shadowColor1);
    $("html").css("--activeStripeTableColor", stripeTableColor1);
  } else {
    $("body").addClass("dark");
    _isDarkMode = 1;
    $("#switch").addClass("switched");
    $(".iconSwitch").addClass("invertColor");

    $("html").css("--activeTextColor", getColor2);
    $("html").css("--activeBgColor", getColor1);
    $("html").css("--activeGlassColor", glassColor2);
    $("html").css("--activeShadowColor", shadowColor2);
    $("html").css("--activeStripeTableColor", stripeTableColor2);
  }
}

$(document).ready(function () {
  var currentPageUrl = window.location.pathname;

  // Iterate through all anchor tags with class "hover"
  $(".hover").each(function () {
    var linkUrl = $(this).attr("href");

    // Check if the link URL matches the current page URL
    if (currentPageUrl === linkUrl) {
      $(this).addClass("active");
      $(this).parent("li").addClass("active");
    }
  });

  $(".nav-link").each(function () {
    var linkUrl = $(this).attr("href");

    // Check if the link URL matches the current page URL
    if (currentPageUrl === linkUrl) {
      $(this).addClass("active");
      $(this).parent("li").addClass("active");
    }
  });

  //Bootstrap Toast Notification
  $("#liveToastBtn").click(function () {
    $("#liveToast").toast("show");
  });

  //Sidebar
  $(".hamburger").click(function () {
    $(this).toggleClass("is-active");
  });

  //Ripple Effect
  const ANIMATEDCLASSNAME = "animated";

  $(".hover").each(function (index) {
    let addAnimation = false;
    const $element = $(this);
    const $elementSpan = $element.find("span");

    $element.on("mouseover", function (e) {
      $elementSpan.css({
        left: e.pageX - $element.offset().left + "px",
        top: e.pageY - $element.offset().top + "px",
      });

      if (addAnimation) {
        $element.addClass(ANIMATEDCLASSNAME);
      }
    });

    $element.on("mouseout", function (e) {
      $elementSpan.css({
        left: e.pageX - $element.offset().left + "px",
        top: e.pageY - $element.offset().top + "px",
      });
    });
  });
});

$(document).ready(function () {
  function updateSearchResults(searchDisplayType) {
    var value = $("#searchInput").val().toLowerCase();
    var count = 0;

    $(".searchData").each(function (index, element) {
      var rowText = $(element).text().toLowerCase();
      var isVisible = rowText.indexOf(value) > -1;

      $(element).css("display", isVisible ? searchDisplayType : "none");

      if (isVisible) {
        count++;
      }
    });

    // Update the reportCount element with the total count
    $("#reportCount").text(" (" + count + ")");
  }

  // Initial update when the page loads
  var displayParam = "flex";
  if ($("#searchInput").length > 0) {
    if ($("#searchInput").hasClass("blockdisplay")) {
      displayParam = "block";
    }
    if ($("#searchInput").hasClass("tabledisplay")) {
      displayParam = "table-row";
    }

    updateSearchResults(displayParam);
    $("#searchInput").on("keyup", function () {
      updateSearchResults(displayParam);
    });
  }
});

var intervalId;
function updateTimestamp() {
  const now = new Date();
  const secondsAgo = Math.floor((now - toastStartTime) / 1000);
  const timestampElement = $(".toast-timestamp");

  if (timestampElement.length > 0) {
    if (secondsAgo < 5) {
      timestampElement.text("Just Now");
    } else if (secondsAgo < 60) {
      timestampElement.text(`${secondsAgo} seconds ago`);
    } else {
      const minutesAgo = Math.floor(secondsAgo / 60);
      timestampElement.text(`${minutesAgo} minutes ago`);
    }
  }
}

function resetTimer() {
  toastStartTime = new Date();
}

var toastStartTime = new Date();

$(".btn-close").on("click", function () {
  // Reset the timer when the close button is clicked
  resetTimer();

  // Stop the interval
  clearInterval(intervalId);
});

// Start the interval and store the ID
intervalId = setInterval(updateTimestamp, 1000);
