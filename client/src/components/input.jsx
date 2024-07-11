function Input({ name, ...props }) {
  return <input type="text" name={name} {...props} />;
}

export default Input;
