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

#include <algorithm>
#include <bitset>
#include <cstdint>
#include <cxxabi.h>
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
