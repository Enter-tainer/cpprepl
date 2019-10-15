import Compiler from '../src/compiler'


describe('test wrappers', () => {
  it('wrapCodeWith', () => {
    expect(Compiler.wrapCodeWith('str')).toBe('value_of(str);')
    expect(Compiler.wrapCodeWith('str', 'qwq')).toBe('qwq(str);')
  })
  
  it('wrapInclude', () => {
    expect(Compiler.wrapInclude('bits/stdc++.h')).toBe('#include "bits/stdc++.h"')
  })

  it('addSemicolon', () => {
    expect(Compiler.addSemicolon('qwq')).toBe('qwq;')
    expect(Compiler.addSemicolon('qwq;;')).toBe('qwq;')
  })

  it('concatCode', () => {
    const code = ['int i;', "i;"]
    const include = ['queue']
    const res = 
`#include "queue"

int main () {
int i;
i;

}`
    expect(Compiler.concatCode(code, include)).toBe(res)
  })
})