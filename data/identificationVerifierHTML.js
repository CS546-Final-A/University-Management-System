function identificationVerificationHTML(type) {
  switch (type) {
    case "ssn":
      return `<label for="id-confirmation">Please enter the last four digits of your social security number: </label>
            <input type="text" id="id-confirmation" name="idconf" placeholder="0000" pattern="\\d{4}" maxlength="4" required>`;
    default:
      throw { status: 400, message: "Register" };
  }
}

export default identificationVerificationHTML;