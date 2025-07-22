/**
 * 简单的测试工具函数
 */

export class TestAssert {
  static assertEqual(actual, expected, message = '') {
    if (actual !== expected) {
      throw new Error(`断言失败 ${message}: 期望 ${expected}, 实际 ${actual}`);
    }
  }

  static assertTrue(condition, message = '') {
    if (!condition) {
      throw new Error(`断言失败 ${message}: 期望为 true`);
    }
  }

  static assertFalse(condition, message = '') {
    if (condition) {
      throw new Error(`断言失败 ${message}: 期望为 false`);
    }
  }

  static assertNotNull(value, message = '') {
    if (value === null || value === undefined) {
      throw new Error(`断言失败 ${message}: 期望非空值`);
    }
  }

  static assertThrows(fn, message = '') {
    try {
      fn();
      throw new Error(`断言失败 ${message}: 期望抛出异常`);
    } catch (error) {
      if (error.message.includes('断言失败')) {
        throw error;
      }
      // 期望的异常，测试通过
    }
  }

  static async assertThrowsAsync(fn, message = '') {
    try {
      await fn();
      throw new Error(`断言失败 ${message}: 期望抛出异常`);
    } catch (error) {
      if (error.message.includes('断言失败')) {
        throw error;
      }
      // 期望的异常，测试通过
    }
  }

  static assertContains(text, substring, message = '') {
    if (!text || !text.includes(substring)) {
      throw new Error(`断言失败 ${message}: 期望 "${text}" 包含 "${substring}"`);
    }
  }

  static assertNotContains(text, substring, message = '') {
    if (text && text.includes(substring)) {
      throw new Error(`断言失败 ${message}: 期望 "${text}" 不包含 "${substring}"`);
    }
  }
}

export function describe(name, fn) {
  console.log(`\n📝 ${name}`);
  console.log('-'.repeat(30));
  return fn();
}

export function it(name, fn) {
  console.log(`  ✓ ${name}`);
  return fn();
}