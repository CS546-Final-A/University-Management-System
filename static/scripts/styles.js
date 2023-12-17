//Menu On Hover

//Avoid Flickering on load
if (_isDarkMode) {
  var getColor1 = $("html").css("--blackColor");
  var getColor2 = $("html").css("--whiteColor");
  var glassColor2 = $("html").css("--glassColor2");
  var shadowColor2 = $("html").css("--shadowColor2");

  $("html").css("--activeTextColor", getColor2);
  $("html").css("--activeBgColor", getColor1);
  $("html").css("--activeGlassColor", glassColor2);
  $("html").css("--activeShadowColor", shadowColor2);
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
  var getColor1 = $("html").css("--blackColor");
  var getColor2 = $("html").css("--whiteColor");
  var glassColor1 = $("html").css("--glassColor1");
  var glassColor2 = $("html").css("--glassColor2");
  var shadowColor1 = $("html").css("--shadowColor1");
  var shadowColor2 = $("html").css("--shadowColor2");

  if ($("body").hasClass("dark")) {
    $("body").removeClass("dark");
    _isDarkMode = 0;
    $("#switch").removeClass("switched");
    $(".iconSwitch").removeClass("invertColor");

    $("html").css("--activeTextColor", getColor1);
    $("html").css("--activeBgColor", getColor2);
    $("html").css("--activeGlassColor", glassColor1);
    $("html").css("--activeShadowColor", shadowColor1);
  } else {
    $("body").addClass("dark");
    _isDarkMode = 1;
    $("#switch").addClass("switched");
    $(".iconSwitch").addClass("invertColor");

    $("html").css("--activeTextColor", getColor2);
    $("html").css("--activeBgColor", getColor1);
    $("html").css("--activeGlassColor", glassColor2);
    $("html").css("--activeShadowColor", shadowColor2);
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
