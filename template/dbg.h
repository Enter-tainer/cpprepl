/*****************************************************************************

                                dbg(...) macro

License (MIT):

  Copyright (c) 2019 David Peter <mail@david-peter.de>

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to
  deal in the Software without restriction, including without limitation the
  rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
  sell copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
  THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.

*****************************************************************************/
#if (defined __GNUG__)
#include <algorithm>
#include <bitset>
#include <cstdint>
#include <iomanip>
#include <iostream>
#include <string>
#include <type_traits>
#include <vector>
using namespace std;
namespace mgt {
template <typename T> struct type_tag {};
namespace pretty_function {

// Compiler-agnostic version of __PRETTY_FUNCTION__ and constants to
// extract the template argument in `type_name_impl`

#if defined(__clang__)
#define DBG_MACRO_PRETTY_FUNCTION __PRETTY_FUNCTION__
static constexpr size_t PREFIX_LENGTH =
    sizeof("const char *mgt::type_name_impl() [T = ") - 1;
static constexpr size_t SUFFIX_LENGTH = sizeof("]") - 1;
#elif defined(__GNUC__) && !defined(__clang__)
#define DBG_MACRO_PRETTY_FUNCTION __PRETTY_FUNCTION__
static constexpr size_t PREFIX_LENGTH =
    sizeof("const char* mgt::type_name_impl() [with T = ") - 1;
static constexpr size_t SUFFIX_LENGTH = sizeof("]") - 1;
#elif defined(_MSC_VER)
#define DBG_MACRO_PRETTY_FUNCTION __FUNCSIG__
static constexpr size_t PREFIX_LENGTH =
    sizeof("const char *__cdecl mgt::type_name_impl<") - 1;
static constexpr size_t SUFFIX_LENGTH = sizeof(">(void)") - 1;
#else
#error "This compiler is currently not supported by dbg_macro."
#endif

} // namespace pretty_function
template <typename T> const char* type_name_impl() {
  return DBG_MACRO_PRETTY_FUNCTION;
}
template <int&... ExplicitArgumentBarrier, typename T>
std::string get_type_name(type_tag<T>) {
  namespace pf = pretty_function;

  std::string type = type_name_impl<T>();
  return type.substr(pf::PREFIX_LENGTH,
                     type.size() - pf::PREFIX_LENGTH - pf::SUFFIX_LENGTH);
}

template <typename T> std::string type_name() {
  if (std::is_volatile<T>::value) {
    if (std::is_pointer<T>::value) {
      return type_name<typename std::remove_volatile<T>::type>() + " volatile";
    } else {
      return "volatile " + type_name<typename std::remove_volatile<T>::type>();
    }
  }
  if (std::is_const<T>::value) {
    if (std::is_pointer<T>::value) {
      return type_name<typename std::remove_const<T>::type>() + " const";
    } else {
      return "const " + type_name<typename std::remove_const<T>::type>();
    }
  }
  if (std::is_pointer<T>::value) {
    return type_name<typename std::remove_pointer<T>::type>() + "*";
  }
  if (std::is_lvalue_reference<T>::value) {
    return type_name<typename std::remove_reference<T>::type>() + "&";
  }
  if (std::is_rvalue_reference<T>::value) {
    return type_name<typename std::remove_reference<T>::type>() + "&&";
  }
  return get_type_name(type_tag<T>{});
}
inline std::string get_type_name(type_tag<std::string>) {
  return "std::string";
}
enum print_base { bin = 2, oct = 8, dec = 10, hex = 16 };

template <typename T> void print_bytes(T val, print_base base = bin) {
  auto f        = cout.flags();
  auto p        = reinterpret_cast<uint8_t*>(&val);
  uint32_t step = sizeof(T);
  if (base != 2) {
    vector<uint32_t> res;
    for (int i = 0; i < step; ++i)
      res.push_back(p[i]);
    reverse(res.begin(), res.end());
    if (base == hex) {
      for (auto p : res) {
        cout.width(4);
        cout.fill(' ');
        cout << showbase << setbase(base) << left << p << ' ';
      }
    } else {
      for (auto p : res)
        cout << setbase(base) << p << ' ';
    }
  } else {
    vector<bitset<8>> res;
    for (int i = 0; i < step; ++i)
      res.push_back(bitset<8>((uint8_t)p[i]));
    reverse(res.begin(), res.end());
    for (auto p : res)
      cout << p << ' ';
  }
  cout << endl;
  cout.flags(f);
}

#define value_of(x)                                                            \
  std::cout << (#x + std::string(" = ") + std::to_string(x) +                  \
                std::string(" :: ") + mgt::type_name<decltype(x)>())           \
            << std::endl

#define type_of(x)                                                             \
  std::cout << (#x + std::string(" :: ") + mgt::type_name<decltype(x)>())      \
            << std::endl
} // namespace mgt
namespace std {
std::string to_string(const string& s) { return '"' + s + '"'; }
template <typename T> std::string to_string(const vector<T>& vec) {
  string res = "[";
  for (auto& i : vec) {
    res += to_string(i);
    res += ", ";
  }
  if (!res.empty())
    res.pop_back(), res.pop_back();
  res += ']';
  return res;
}
} // namespace std
#else
#include <stdio.h>
#include <string.h>
#define type_of(x)                                                             \
  _Generic((x), \
    char: "char", \
    short int: "short int", \
    unsigned short int: "unsigned short int", \
    int: "int", \
    unsigned int: "unsigned int", \
    long int: "long int", \
    unsigned long int: "unsigned long int", \
    long long int: "long long int", \
    unsigned long long int: "unsigned long long int", \
    float: "float", \
    double: "double", \
    long double: "long double", \
    void *: "void*")

#define value_of(x)                                                            \
  {                                                                            \
    const char* type_of_x = type_of(x);                                        \
    if (!strcmp(type_of_x, "int")) {                                           \
      printf(#x " = %d :: %s\n", x, type_of_x);                                \
    } else if (!strcmp(type_of_x, "char")) {                                   \
      printf(#x " = '%c' :: %s\n", x, type_of_x);                              \
    } else if (!strcmp(type_of_x, "short int")) {                              \
      printf(#x " = %hd :: %s\n", x, type_of_x);                               \
    } else if (!strcmp(type_of_x, "unsigned short int")) {                     \
      printf(#x " = %hu :: %s\n", x, type_of_x);                               \
    } else if (!strcmp(type_of_x, "unsigned int")) {                           \
      printf(#x " = %u :: %s\n", x, type_of_x);                                \
    } else if (!strcmp(type_of_x, "long int")) {                               \
      printf(#x " = %ld :: %s\n", x, type_of_x);                               \
    } else if (!strcmp(type_of_x, "unsigned long int")) {                      \
      printf(#x " = %lu :: %s\n", x, type_of_x);                               \
    } else if (!strcmp(type_of_x, "long long int")) {                          \
      printf(#x " = %lld :: %s\n", x, type_of_x);                              \
    } else if (!strcmp(type_of_x, "unsigned long long int")) {                 \
      printf(#x " = %llu :: %s\n", x, type_of_x);                              \
    } else if (!strcmp(type_of_x, "float")) {                                  \
      printf(#x " = %f :: %s\n", x, type_of_x);                                \
    } else if (!strcmp(type_of_x, "double")) {                                 \
      printf(#x " = %f :: %s\n", x, type_of_x);                                \
    } else if (!strcmp(type_of_x, "long double")) {                            \
      printf(#x " = %Lf :: %s\n", x, type_of_x);                               \
    }                                                                          \
  }

#endif
