//Menu On Hover
$("body").on("mouseenter mouseleave", ".nav-item", function (e) {
  if ($(window).width() > 750) {
    var _d = $(e.target).closest(".nav-item");
    if (_d.hasClass("show")) {
      _d.removeClass("show");
    } else {
      _d.addClass("show");
    }
  }
});

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

//Bootstrap Toast Notification
$(document).ready(function () {
  $("#liveToastBtn").click(function () {
    $("#liveToast").toast("show");
  });
});
