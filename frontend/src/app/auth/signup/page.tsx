"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { authService } from "@/src/features/auth/service/authService";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    passwordConfirm: "",
    email: "",
    nickname: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [validation, setValidation] = useState({
    loginId: { checked: false, available: false, message: "" },
    email: { checked: false, available: false, message: "" },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // 입력값이 변경되면 중복 확인 상태 초기화
    if (name === "loginId") {
      setValidation((prev) => ({
        ...prev,
        loginId: { checked: false, available: false, message: "" },
      }));
    } else if (name === "email") {
      setValidation((prev) => ({
        ...prev,
        email: { checked: false, available: false, message: "" },
      }));
    }
  };

  const checkLoginId = async () => {
    if (!formData.loginId) {
      setValidation((prev) => ({
        ...prev,
        loginId: {
          checked: true,
          available: false,
          message: "아이디를 입력하세요",
        },
      }));
      return;
    }

    try {
      const response = await authService.checkLoginId(formData.loginId);
      if (response.success) {
        setValidation((prev) => ({
          ...prev,
          loginId: {
            checked: true,
            available: true,
            message: "사용 가능한 아이디입니다",
          },
        }));
      }
    } catch (err) {
      setValidation((prev) => ({
        ...prev,
        loginId: {
          checked: true,
          available: false,
          message: "이미 사용 중인 아이디입니다",
        },
      }));
    }
  };

  const checkEmail = async () => {
    if (!formData.email) {
      setValidation((prev) => ({
        ...prev,
        email: {
          checked: true,
          available: false,
          message: "이메일을 입력하세요",
        },
      }));
      return;
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setValidation((prev) => ({
        ...prev,
        email: {
          checked: true,
          available: false,
          message: "올바른 이메일 형식이 아닙니다",
        },
      }));
      return;
    }

    try {
      const response = await authService.checkEmail(formData.email);
      if (response.success) {
        setValidation((prev) => ({
          ...prev,
          email: {
            checked: true,
            available: true,
            message: "사용 가능한 이메일입니다",
          },
        }));
      }
    } catch (err) {
      setValidation((prev) => ({
        ...prev,
        email: {
          checked: true,
          available: false,
          message: "이미 사용 중인 이메일입니다",
        },
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // 유효성 검증
    if (!validation.loginId.available) {
      setError("아이디 중복 확인을 해주세요");
      return;
    }

    if (formData.email && !validation.email.available) {
      setError("이메일 중복 확인을 해주세요");
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다");
      return;
    }

    if (formData.password.length < 8) {
      setError("비밀번호는 최소 8자 이상이어야 합니다");
      return;
    }

    setIsLoading(true);

    try {
      const signupData = {
        loginId: formData.loginId,
        password: formData.password,
        email: formData.email || undefined,
        nickname: formData.nickname || undefined,
      };

      const response = await authService.signup(signupData);
      if (response.success) {
        alert("회원가입이 완료되었습니다. 로그인 페이지로 이동합니다.");
        router.push("/auth/login");
      } else {
        setError(response.message || "회원가입에 실패했습니다.");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError("회원가입에 실패했습니다. 다시 시도해주세요.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-gray-800 to-black rounded-2xl mb-4">
            <span className="text-white font-bold text-2xl">D</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">DailyTask</h1>
          <p className="text-gray-600">새로운 계정을 만들어보세요</p>
        </div>

        {/* Signup Form */}
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* 아이디 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                아이디 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <User className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    name="loginId"
                    value={formData.loginId}
                    onChange={handleChange}
                    placeholder="아이디를 입력하세요"
                    required
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-gray-900 transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={checkLoginId}
                  className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  중복 확인
                </button>
              </div>
              {validation.loginId.checked && (
                <p
                  className={`mt-1 text-sm flex items-center gap-1 ${
                    validation.loginId.available
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {validation.loginId.available ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {validation.loginId.message}
                </p>
              )}
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                비밀번호 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="비밀번호를 입력하세요 (최소 8자)"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-gray-900 transition-colors"
                />
              </div>
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                비밀번호 확인 <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Lock className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  name="passwordConfirm"
                  value={formData.passwordConfirm}
                  onChange={handleChange}
                  placeholder="비밀번호를 다시 입력하세요"
                  required
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-gray-900 transition-colors"
                />
              </div>
              {formData.passwordConfirm && (
                <p
                  className={`mt-1 text-sm flex items-center gap-1 ${
                    formData.password === formData.passwordConfirm
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {formData.password === formData.passwordConfirm ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      비밀번호가 일치합니다
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4" />
                      비밀번호가 일치하지 않습니다
                    </>
                  )}
                </p>
              )}
            </div>

            {/* 이메일 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                이메일
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <Mail className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="이메일을 입력하세요 (선택)"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-gray-900 transition-colors"
                  />
                </div>
                {formData.email && (
                  <button
                    type="button"
                    onClick={checkEmail}
                    className="px-4 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium text-gray-700 whitespace-nowrap"
                  >
                    중복 확인
                  </button>
                )}
              </div>
              {validation.email.checked && (
                <p
                  className={`mt-1 text-sm flex items-center gap-1 ${
                    validation.email.available
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {validation.email.available ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  {validation.email.message}
                </p>
              )}
            </div>

            {/* 닉네임 */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                닉네임
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <User className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="닉네임을 입력하세요 (선택)"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-lg outline-none focus:border-gray-900 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span>처리 중...</span>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  회원가입
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              이미 계정이 있으신가요?{" "}
              <a
                href="/auth/login"
                className="text-gray-900 font-medium hover:underline"
              >
                로그인
              </a>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2026 DailyTask. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
