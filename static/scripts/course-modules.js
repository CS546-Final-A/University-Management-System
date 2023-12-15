const newModuleForm = {
  shown: false,
  show: () => {
    if (!newModuleForm.shown) {
      newModuleForm.shown = true;
      $("#newmoduleform").css("display", "block");
    }
  },
  hide: () => {
    if (newModuleForm.shown) {
      newModuleForm.shown = false;
      $("#newmoduleform").css("display", "");
    }
  },
  toggle: () => {
    if (newModuleForm.shown) {
      newModuleForm.hide();
    } else {
      newModuleForm.show();
    }
  },
};

if ($("#newmodule")) {
  $("#newmodule").on("click", newModuleForm.toggle);
}
