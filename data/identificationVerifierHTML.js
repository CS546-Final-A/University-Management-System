function identificationVerificationHTML(type) {
  switch (type) {
    case "ssn":
      return `<label for="id-confirmation">Please enter the last four digits of your social security number</label>
            <input type="number" id="id-confirmation" name="idconf" placeholder="0000" maxlength="4">`;
    default:
      throw { status: 400, message: "Invalid identification type" };
  }
}

export default identificationVerificationHTML;
