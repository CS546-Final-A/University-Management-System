//Menu On Hover

//Switch light/dark

$("#switch").on("click", function () {
  var getColor1 = $("html").css("--blackColor");
  var getColor2 = $("html").css("--whiteColor");
  var glassColor1 = $("html").css("--glassColor1");
  var glassColor2 = $("html").css("--glassColor2");

  if ($("body").hasClass("dark")) {
    $("body").removeClass("dark");
    $("#switch").removeClass("switched");

    $("html").css("--activeTextColor", getColor1);
    $("html").css("--activeBgColor", getColor2);
    $("html").css("--activeGlassColor", glassColor1);
  } else {
    $("body").addClass("dark");
    $("#switch").addClass("switched");

    $("html").css("--activeTextColor", getColor2);
    $("html").css("--activeBgColor", getColor1);
    $("html").css("--activeGlassColor", glassColor2);
  }
});

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
