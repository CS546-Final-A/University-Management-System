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
  const ELEMENTS = document.querySelectorAll(".hover");
  const ELEMENTS_SPAN = [];

  ELEMENTS.forEach((element, index) => {
    let addAnimation = false;

    // If The span element for this element does not exist in the array, add it.
    if (!ELEMENTS_SPAN[index])
      ELEMENTS_SPAN[index] = element.querySelector("span");

    element.addEventListener("mouseover", (e) => {
      ELEMENTS_SPAN[index].style.left = e.pageX - element.offsetLeft + "px";
      ELEMENTS_SPAN[index].style.top = e.pageY - element.offsetTop + "px";

      // Add an animation-class to animate via CSS.
      if (addAnimation) element.classList.add(ANIMATEDCLASSNAME);
    });

    element.addEventListener("mouseout", (e) => {
      ELEMENTS_SPAN[index].style.left = e.pageX - element.offsetLeft + "px";
      ELEMENTS_SPAN[index].style.top = e.pageY - element.offsetTop + "px";
    });
  });
});
