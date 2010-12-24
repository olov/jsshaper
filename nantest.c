int main() {
  double nan = 0.0/0.0;
  double nan2 = 0.0/0.0;
  double posinf = 1.0/0.0;
  double neginf = -1.0/0.0;
  double poszero = 0.0;
  double negzero = -poszero;
  printf("%f == %f? %s\n", nan, nan2, nan == nan2 ? "true" : "false");
  printf("%f < %f? %s\n", neginf, posinf, neginf < posinf ? "true" : "false");
  printf("%f == %f? %s\n", poszero, negzero,
         poszero == negzero ? "true" : "false");
  return 0;
}
